import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma, comptes, voyageur, hotelier, jetons, initialiserTests } from "./helpers.js";
import { randomUUID } from "node:crypto";

describe("Chambres", () => {
  initialiserTests();

  it("TA-004 — rend une chambre indisponible seulement pendant le chevauchement", async () => {
    const chambresPendantReservation = await request(app).get(
      "/chambres?date_debut=2026-10-10&date_fin=2026-10-12",
    );
    const chambresApresReservation = await request(app).get(
      "/chambres?date_debut=2026-10-11&date_fin=2026-10-13",
    );

    expect(chambresPendantReservation.status).toBe(200);
    expect(chambresPendantReservation.body).toHaveLength(31);
    expect(
      chambresPendantReservation.body.some((chambre) => chambre.id === 4),
    ).toBe(false);

    expect(chambresApresReservation.status).toBe(200);
    expect(chambresApresReservation.body).toHaveLength(32);
    expect(
      chambresApresReservation.body.some((chambre) => chambre.id === 4),
    ).toBe(true);
  });

  it("TA-008 — crée, modifie et supprime une chambre temporaire", async () => {
    let chambreId;

    try {
      const creation = await request(app)
        .post("/chambres")
        .set("Authorization", "Bearer " + jetons.jetonHotelier)
        .send({
          hotelId: hotelier.hotel_id,
          numero: 99999,
          categorie: "test",
          capacite: 1,
          prixNuit: 50,
          description: "Chambre temporaire",
        });

      expect(creation.status).toBe(201);
      chambreId = creation.body.id;

      const modification = await request(app)
        .patch("/chambres/" + chambreId)
        .set("Authorization", "Bearer " + jetons.jetonHotelier)
        .send({ prixNuit: 60 });

      expect(modification.status).toBe(200);
      expect(modification.body.prixNuit).toBe(60);

      const suppression = await request(app)
        .delete("/chambres/" + chambreId)
        .set("Authorization", "Bearer " + jetons.jetonHotelier);

      expect(suppression.status).toBe(200);
      chambreId = undefined;
    } finally {
      if (chambreId !== undefined) {
        await prisma.chambres.deleteMany({ where: { id: chambreId } });
      }
    }
  });

  it("Complement 03 — refuse un identifiant de chambre invalide ou absent", async () => {
    const idInvalide = await request(app).get("/chambres/invalide");
    const chambreAbsente = await request(app).get("/chambres/999999");

    expect(idInvalide.status).toBe(400);
    expect(idInvalide.body).toHaveProperty("erreur");

    expect(chambreAbsente.status).toBe(404);
    expect(chambreAbsente.body).toHaveProperty("erreur");
  });

  it("Complement 04 — refuse des dates de recherche incorrectes", async () => {
    const dateInvalide = await request(app).get(
      "/chambres?date_debut=pas-une-date&date_fin=2099-06-12",
    );
    const datesDansLeMauvaisOrdre = await request(app).get(
      "/chambres?date_debut=2099-06-12&date_fin=2099-06-10",
    );

    expect(dateInvalide.status).toBe(400);
    expect(dateInvalide.body).toHaveProperty("erreur");

    expect(datesDansLeMauvaisOrdre.status).toBe(400);
    expect(datesDansLeMauvaisOrdre.body).toHaveProperty("erreur");
  });

  it("Complement 13 — refuse des données incorrectes pour créer une chambre", async () => {
    const reponse = await request(app)
      .post("/chambres")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        hotelId: -1,
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 14 — refuse un identifiant incorrect pour modifier une chambre", async () => {
    const reponse = await request(app)
      .patch("/chambres/abc")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        prixNuit: 100,
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 15 — refuse de modifier une chambre absente", async () => {
    const reponse = await request(app)
      .patch("/chambres/999999")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        prixNuit: 100,
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 16 — refuse de supprimer une chambre avec un identifiant incorrect", async () => {
    const reponse = await request(app)
      .delete("/chambres/abc")
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 17 — refuse de supprimer une chambre absente", async () => {
    const reponse = await request(app)
      .delete("/chambres/999999")
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 25 — cherche des chambres avec des filtres simples", async () => {
    const parIdEtPrix = await request(app).get(
      "/chambres?hotel=1&prix_max=500",
    );
    const parNomHotel = await request(app).get("/chambres?hotel=Amor");
    const parAncienPrix = await request(app).get("/chambres?prixmax=500");

    expect(parIdEtPrix.status).toBe(200);
    expect(Array.isArray(parIdEtPrix.body)).toBe(true);

    expect(parNomHotel.status).toBe(200);
    expect(Array.isArray(parNomHotel.body)).toBe(true);

    expect(parAncienPrix.status).toBe(200);
    expect(Array.isArray(parAncienPrix.body)).toBe(true);
  });

  it("Complement 30 — refuse la gestion des chambres sans hôtel associé", async () => {
    const jetonSansHotel = jwt.sign(
      {
        id: hotelier.id,
        email: hotelier.email,
        role: "hotelier",
        hotelId: null,
      },
      process.env.JWT_SECRET ?? "dev-secret",
    );

    const creation = await request(app)
      .post("/chambres")
      .set("Authorization", "Bearer " + jetonSansHotel)
      .send({
        hotelId: 1,
        numero: 9999,
        categorie: "test",
        capacite: 1,
        prixNuit: 50,
      });
    const modification = await request(app)
      .patch("/chambres/1")
      .set("Authorization", "Bearer " + jetonSansHotel)
      .send({
        prixNuit: 50,
      });
    const suppression = await request(app)
      .delete("/chambres/1")
      .set("Authorization", "Bearer " + jetonSansHotel);

    expect(creation.status).toBe(403);
    expect(creation.body).toHaveProperty("erreur");

    expect(modification.status).toBe(403);
    expect(modification.body).toHaveProperty("erreur");

    expect(suppression.status).toBe(403);
    expect(suppression.body).toHaveProperty("erreur");
  });

  it("Complement 31 — refuse de modifier ou supprimer la chambre d'un autre hôtel", async () => {
    const chambreAutreHotel = await prisma.chambres.findFirst({
      where: {
        hotelId: {
          not: hotelier.hotel_id,
        },
      },
    });

    expect(chambreAutreHotel).toBeDefined();

    const modification = await request(app)
      .patch("/chambres/" + chambreAutreHotel.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        prixNuit: chambreAutreHotel.prixNuit,
      });
    const suppression = await request(app)
      .delete("/chambres/" + chambreAutreHotel.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    expect(modification.status).toBe(403);
    expect(modification.body).toHaveProperty("erreur");

    expect(suppression.status).toBe(403);
    expect(suppression.body).toHaveProperty("erreur");
  });

  it("Complement 32 — refuse de supprimer une chambre qui a des réservations", async () => {
    const chambreAvecReservation = await prisma.chambres.findFirst({
      where: {
        hotelId: hotelier.hotel_id,
        reservations: {
          some: {},
        },
      },
    });

    expect(chambreAvecReservation).toBeDefined();

    const reponse = await request(app)
      .delete("/chambres/" + chambreAvecReservation.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 39 — accepte une modification de chambre sans changer ses valeurs", async () => {
    const chambre = await prisma.chambres.findFirst({
      where: {
        hotelId: hotelier.hotel_id,
      },
    });

    expect(chambre).toBeDefined();

    const modification = await request(app)
      .patch("/chambres/" + chambre.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({
        numero: chambre.numero,
        categorie: chambre.categorie,
        capacite: chambre.capacite,
        prixNuit: chambre.prixNuit,
        description: chambre.description,
        disponible: chambre.disponible,
      });

    expect(modification.status).toBe(200);
    expect(modification.body.numero).toBe(chambre.numero);
    expect(modification.body.categorie).toBe(chambre.categorie);
    expect(modification.body.capacite).toBe(chambre.capacite);
    expect(modification.body.prixNuit).toBe(chambre.prixNuit);
    expect(modification.body.description).toBe(chambre.description);
    expect(modification.body.disponible).toBe(chambre.disponible);
  });

  it("Complement 40 — accepte une modification de chambre vide sans changer ses valeurs", async () => {
    const chambre = await prisma.chambres.findFirst({
      where: {
        hotelId: hotelier.hotel_id,
      },
    });

    expect(chambre).toBeDefined();

    const modification = await request(app)
      .patch("/chambres/" + chambre.id)
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
      .send({});

    expect(modification.status).toBe(200);
    expect(modification.body.id).toBe(chambre.id);
    expect(modification.body.prixNuit).toBe(chambre.prixNuit);
  });
});
