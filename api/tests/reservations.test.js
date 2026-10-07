import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma, comptes, voyageur, hotelier, jetons, initialiserTests } from "./helpers.js";
import { randomUUID } from "node:crypto";

describe("Reservations", () => {
  initialiserTests();

  it("TA-007 — refuse une réservation envoyée par un hôtelier", async () => {
    const reponse = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({});

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-009 — crée une réservation et la retrouve dans son compte", async () => {
    let reservationId;

    try {
      const creation = await request(app)
        .post("/reservations")
        .set("Authorization", "Bearer " + jetons.jetonVoyageur)
        .send({
          chambreId: 1,
          dateDebut: "2099-06-10",
          dateFin: "2099-06-12",
        });

      expect(creation.status).toBe(201);
      expect(creation.body.statut).toBe("en_attente");
      reservationId = creation.body.id;

      const reservations = await request(app)
        .get("/reservations/mine")
        .set("Authorization", "Bearer " + jetons.jetonVoyageur);

      expect(reservations.status).toBe(200);
      expect(
        reservations.body.some(
          (reservation) => reservation.id === reservationId,
        ),
      ).toBe(true);
    } finally {
      if (reservationId !== undefined) {
        await prisma.reservations.deleteMany({
          where: { id: reservationId },
        });
      }
    }
  });

  it("TA-010 — vérifie le propriétaire, la confirmation et l'annulation", async () => {
    const autreVoyageur = comptes.find(
      (compte) => compte.role === "voyageur" && compte.id !== voyageur.id,
    );
    const connexionAutreVoyageur = await request(app)
      .post("/auth/login")
      .send({
        email: autreVoyageur.email,
        motDePasse: autreVoyageur.mot_de_passe_clair,
      });

    expect(connexionAutreVoyageur.status).toBe(200);

    let reservationId;

    try {
      const creation = await request(app)
        .post("/reservations")
        .set("Authorization", "Bearer " + jetons.jetonVoyageur)
        .send({
          chambreId: 1,
          dateDebut: "2099-06-14",
          dateFin: "2099-06-16",
        });

      expect(creation.status).toBe(201);
      reservationId = creation.body.id;

      const annulationAutreVoyageur = await request(app)
        .delete("/reservations/" + reservationId)
        .set(
          "Authorization",
          "Bearer " + connexionAutreVoyageur.body.token,
        );

      expect(annulationAutreVoyageur.status).toBe(403);

      const confirmation = await request(app)
        .patch("/reservations/" + reservationId)
        .set("Authorization", "Bearer " + jetons.jetonHotelier)
        .send({ statut: "confirmee" });

      expect(confirmation.status).toBe(200);
      expect(confirmation.body.statut).toBe("confirmee");

      const annulationProprietaire = await request(app)
        .delete("/reservations/" + reservationId)
        .set("Authorization", "Bearer " + jetons.jetonVoyageur);

      expect(annulationProprietaire.status).toBe(200);
      expect(annulationProprietaire.body.statut).toBe("annulee");
    } finally {
      if (reservationId !== undefined) {
        await prisma.reservations.deleteMany({
          where: { id: reservationId },
        });
      }
    }
  });

  it("Complement 10 — refuse une réservation avec un corps incorrect", async () => {
    const reponse = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
      .send({
        chambreId: "texte",
        dateDebut: "",
        dateFin: "",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 11 — refuse une réservation avec des dates invalides", async () => {
    const datesInvalides = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
      .send({
        chambreId: 1,
        dateDebut: "pas-une-date",
        dateFin: "2099-06-12",
      });

    const datesDansLeMauvaisOrdre = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
      .send({
        chambreId: 1,
        dateDebut: "2099-06-12",
        dateFin: "2099-06-10",
      });

    expect(datesInvalides.status).toBe(400);
    expect(datesInvalides.body).toHaveProperty("erreur");

    expect(datesDansLeMauvaisOrdre.status).toBe(400);
    expect(datesDansLeMauvaisOrdre.body).toHaveProperty("erreur");
  });

  it("Complement 12 — refuse une réservation pour une chambre absente", async () => {
    const reponse = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
      .send({
        chambreId: 999999,
        dateDebut: "2099-06-10",
        dateFin: "2099-06-12",
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 18 — refuse un identifiant incorrect pour modifier une réservation", async () => {
    const reponse = await request(app)
      .patch("/reservations/abc")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 19 — refuse de modifier une réservation absente", async () => {
    const reponse = await request(app)
      .patch("/reservations/999999")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 20 — refuse un statut de réservation incorrect", async () => {
    const reponse = await request(app)
      .patch("/reservations/1")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        statut: "terminee",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 21 — refuse un identifiant incorrect pour supprimer une réservation", async () => {
    const reponse = await request(app)
      .delete("/reservations/abc")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 22 — refuse de supprimer une réservation absente", async () => {
    const reponse = await request(app)
      .delete("/reservations/999999")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 26 — permet au voyageur et à l'hôtelier de consulter leurs données", async () => {
    const profil = await request(app)
      .get("/me")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);
    const profilVoyageur = await request(app)
      .get("/voyageurs/me")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);
    const reservationsVoyageur = await request(app)
      .get("/reservations/mine")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);
    const reservationsHotelier = await request(app)
      .get("/reservations/received")
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    expect(profil.status).toBe(200);
    expect(profil.body.email).toBe(voyageur.email);

    expect(profilVoyageur.status).toBe(200);
    expect(profilVoyageur.body.role).toBe("voyageur");

    expect(reservationsVoyageur.status).toBe(200);
    expect(Array.isArray(reservationsVoyageur.body)).toBe(true);

    expect(reservationsHotelier.status).toBe(200);
    expect(Array.isArray(reservationsHotelier.body)).toBe(true);
  });

  it("Complement 33 — refuse les changements de réservation sans hôtel associé", async () => {
    const reservationHotel = await prisma.reservations.findFirst({
      where: {
        chambre: {
          hotelId: hotelier.hotel_id,
        },
      },
    });

    expect(reservationHotel).toBeDefined();

    const jetonSansHotel = jwt.sign(
      {
        id: hotelier.id,
        email: hotelier.email,
        role: "hotelier",
        hotelId: null,
      },
      process.env.JWT_SECRET ?? "dev-secret",
    );

    const reponse = await request(app)
      .patch("/reservations/" + reservationHotel.id)
      .set("Authorization", "Bearer " + jetonSansHotel)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 34 — refuse la modification d'une réservation d'un autre hôtel", async () => {
    const reservationAutreHotel = await prisma.reservations.findFirst({
      where: {
        chambre: {
          hotelId: {
            not: hotelier.hotel_id,
          },
        },
      },
    });

    expect(reservationAutreHotel).toBeDefined();

    const reponse = await request(app)
      .patch("/reservations/" + reservationAutreHotel.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 35 — refuse une transition de réservation interdite", async () => {
    const reservationConfirmee = await prisma.reservations.findFirst({
      where: {
        statut: "confirmee",
        chambre: {
          hotelId: hotelier.hotel_id,
        },
      },
    });

    expect(reservationConfirmee).toBeDefined();

    const reponse = await request(app)
      .patch("/reservations/" + reservationConfirmee.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        statut: "refusee",
      });

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 36 — refuse d'annuler la réservation d'un autre voyageur", async () => {
    const reservationAutreVoyageur = await prisma.reservations.findFirst({
      where: {
        compteId: {
          not: voyageur.id,
        },
      },
    });

    expect(reservationAutreVoyageur).toBeDefined();

    const reponse = await request(app)
      .delete("/reservations/" + reservationAutreVoyageur.id)
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 37 — refuse d'annuler une réservation déjà terminée", async () => {
    const reservationAnnulee = await prisma.reservations.findFirst({
      where: {
        compteId: voyageur.id,
        statut: "annulee",
      },
    });

    expect(reservationAnnulee).toBeDefined();

    const reponse = await request(app)
      .delete("/reservations/" + reservationAnnulee.id)
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });
});
