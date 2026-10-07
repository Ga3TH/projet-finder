// describe("nom", ...) regroupe plusieurs tests.
// it("nom du test", ...) crée un test.
// async permet d'utiliser await pour attendre une réponse.
// await attend la fin d'une requête avant de continuer.
// request(app).get(...) envoie une requête GET à l'API.
// .post(...), .patch(...) et .delete(...) envoient d'autres types de requêtes.
// .send({...}) envoie des données dans le corps de la requête.
// .set("Authorization", "...") ajoute un en-tête, par exemple le jeton de connexion.
// expect(valeur).toBe(...) vérifie que deux valeurs simples sont égales.
// toEqual(...) compare une valeur ou un objet.
// toHaveProperty("erreur") vérifie que l'objet contient la propriété "erreur".
// expect.any(String) vérifie qu'une valeur est une chaîne de caractères.
// beforeAll(...) s'exécute une fois avant les tests.
// afterAll(...) s'exécute une fois après les tests.
// const crée une variable qui ne sera pas réassignée.
// let crée une variable qui pourra recevoir une nouvelle valeur.
// Les codes HTTP indiquent le résultat : 200 succès, 400 requête invalide,
// 401 non connecté, 403 accès refusé, 404 introuvable et 409 conflit.
// randomUUID() crée un identifiant unique pour éviter un doublon de test.
// jwt.sign(...) fabrique un jeton de connexion de test.

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma } from "../src/app.js";

const comptes = JSON.parse(
  readFileSync(new URL("../finder-data/comptes.json", import.meta.url), "utf8"),
);

const voyageur = comptes.find((compte) => compte.role === "voyageur");
const hotelier = comptes.find((compte) => compte.role === "hotelier");

let jetonVoyageur;
let jetonHotelier;

describe("Tests simples de l'API Finder", () => {
  beforeAll(async () => {
    await prisma.$connect();

    const nombreHotels = await prisma.hotels.count();
    const nombreChambres = await prisma.chambres.count();
    const nombreComptes = await prisma.comptes.count();

    if (nombreHotels < 3 || nombreChambres < 32 || nombreComptes < 8) {
      throw new Error(
        "La base DATABASE_URL ne contient pas les données de démonstration. " +
          "Les tests n'ont rien modifié. Charge le seed dans une base de test.",
      );
    }

    const connexionVoyageur = await request(app).post("/auth/login").send({
      email: voyageur.email,
      motDePasse: voyageur.mot_de_passe_clair,
    });

    expect(connexionVoyageur.status).toBe(200);
    expect(connexionVoyageur.body.token).toEqual(expect.any(String));
    jetonVoyageur = connexionVoyageur.body.token;

    const connexionHotelier = await request(app).post("/auth/login").send({
      email: hotelier.email,
      motDePasse: hotelier.mot_de_passe_clair,
    });

    expect(connexionHotelier.status).toBe(200);
    expect(connexionHotelier.body.token).toEqual(expect.any(String));
    jetonHotelier = connexionHotelier.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("TA-001 — refuse un identifiant d'hôtel invalide ou absent", async () => {
    const idInvalide = await request(app).get("/hotels/invalide");
    const hotelAbsent = await request(app).get("/hotels/999999");

    expect(idInvalide.status).toBe(400);
    expect(idInvalide.body).toHaveProperty("erreur");

    expect(hotelAbsent.status).toBe(404);
    expect(hotelAbsent.body).toHaveProperty("erreur");
  });

  it("TA-002 — refuse les chambres d'un hôtel absent", async () => {
    const reponse = await request(app).get("/hotels/999999/chambres");

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-003 — refuse un identifiant de chambre invalide ou absent", async () => {
    const idInvalide = await request(app).get("/chambres/invalide");
    const chambreAbsente = await request(app).get("/chambres/999999");

    expect(idInvalide.status).toBe(400);
    expect(idInvalide.body).toHaveProperty("erreur");

    expect(chambreAbsente.status).toBe(404);
    expect(chambreAbsente.body).toHaveProperty("erreur");
  });

  it("TA-004 — refuse des dates de recherche incorrectes", async () => {
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

  it("TA-005 — refuse une inscription incorrecte ou déjà utilisée", async () => {
    const inscriptionIncorrecte = await request(app)
      .post("/auth/register")
      .send({
        email: "pas-un-email",
        motDePasse: "court",
      });

    const emailDejaUtilise = await request(app)
      .post("/auth/register")
      .send({
        email: voyageur.email,
        motDePasse: voyageur.mot_de_passe_clair,
      });

    expect(inscriptionIncorrecte.status).toBe(400);
    expect(inscriptionIncorrecte.body).toHaveProperty("erreur");

    expect(emailDejaUtilise.status).toBe(409);
    expect(emailDejaUtilise.body).toHaveProperty("erreur");
  });

  it("TA-006 — refuse une connexion avec des identifiants incorrects", async () => {
    const emailInvalide = await request(app).post("/auth/login").send({
      email: "pas-un-email",
    });

    const motDePasseInvalide = await request(app).post("/auth/login").send({
      email: voyageur.email,
      motDePasse: "mot-de-passe-incorrect",
    });

    expect(emailInvalide.status).toBe(400);
    expect(emailInvalide.body).toHaveProperty("erreur");

    expect(motDePasseInvalide.status).toBe(401);
    expect(motDePasseInvalide.body).toHaveProperty("erreur");
  });

  it("TA-007 — refuse l'accès aux routes privées sans jeton", async () => {
    const profil = await request(app).get("/me");
    const profilVoyageur = await request(app).get("/voyageurs/me");
    const reservationsVoyageur = await request(app).get("/reservations/mine");
    const reservationsHotelier = await request(app).get(
      "/reservations/received",
    );
    const routeAdmin = await request(app).get("/admin/secret");

    expect(profil.status).toBe(401);
    expect(profil.body).toHaveProperty("erreur");

    expect(profilVoyageur.status).toBe(401);
    expect(profilVoyageur.body).toHaveProperty("erreur");

    expect(reservationsVoyageur.status).toBe(401);
    expect(reservationsVoyageur.body).toHaveProperty("erreur");

    expect(reservationsHotelier.status).toBe(401);
    expect(reservationsHotelier.body).toHaveProperty("erreur");

    expect(routeAdmin.status).toBe(401);
    expect(routeAdmin.body).toHaveProperty("erreur");
  });

  it("TA-008 — refuse un jeton invalide", async () => {
    const reponse = await request(app)
      .get("/me")
      .set("Authorization", "Bearer jeton-invalide");

    expect(reponse.status).toBe(401);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-009 — refuse l'accès si le rôle ne convient pas", async () => {
    const voyageurSurRouteHotelier = await request(app)
      .get("/reservations/received")
      .set("Authorization", "Bearer " + jetonVoyageur);

    const hotelierSurRouteVoyageur = await request(app)
      .get("/reservations/mine")
      .set("Authorization", "Bearer " + jetonHotelier);

    const chambrePourUnAutreHotel = await request(app)
      .post("/chambres")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        hotelId: 2,
        numero: 9999,
        categorie: "test",
        capacite: 1,
        prixNuit: 50,
      });

    expect(voyageurSurRouteHotelier.status).toBe(403);
    expect(voyageurSurRouteHotelier.body).toHaveProperty("erreur");

    expect(hotelierSurRouteVoyageur.status).toBe(403);
    expect(hotelierSurRouteVoyageur.body).toHaveProperty("erreur");

    expect(chambrePourUnAutreHotel.status).toBe(403);
    expect(chambrePourUnAutreHotel.body).toHaveProperty("erreur");
  });

  it("TA-010 — refuse une réservation avec un corps incorrect", async () => {
    const reponse = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetonVoyageur)
      .send({
        chambreId: "texte",
        dateDebut: "",
        dateFin: "",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-011 — refuse une réservation avec des dates invalides", async () => {
    const datesInvalides = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetonVoyageur)
      .send({
        chambreId: 1,
        dateDebut: "pas-une-date",
        dateFin: "2099-06-12",
      });

    const datesDansLeMauvaisOrdre = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetonVoyageur)
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

  it("TA-012 — refuse une réservation pour une chambre absente", async () => {
    const reponse = await request(app)
      .post("/reservations")
      .set("Authorization", "Bearer " + jetonVoyageur)
      .send({
        chambreId: 999999,
        dateDebut: "2099-06-10",
        dateFin: "2099-06-12",
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-013 — refuse des données incorrectes pour créer une chambre", async () => {
    const reponse = await request(app)
      .post("/chambres")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        hotelId: -1,
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-014 — refuse un identifiant incorrect pour modifier une chambre", async () => {
    const reponse = await request(app)
      .patch("/chambres/abc")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        prixNuit: 100,
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-015 — refuse de modifier une chambre absente", async () => {
    const reponse = await request(app)
      .patch("/chambres/999999")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        prixNuit: 100,
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-016 — refuse de supprimer une chambre avec un identifiant incorrect", async () => {
    const reponse = await request(app)
      .delete("/chambres/abc")
      .set("Authorization", "Bearer " + jetonHotelier);

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-017 — refuse de supprimer une chambre absente", async () => {
    const reponse = await request(app)
      .delete("/chambres/999999")
      .set("Authorization", "Bearer " + jetonHotelier);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-018 — refuse un identifiant incorrect pour modifier une réservation", async () => {
    const reponse = await request(app)
      .patch("/reservations/abc")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-019 — refuse de modifier une réservation absente", async () => {
    const reponse = await request(app)
      .patch("/reservations/999999")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-020 — refuse un statut de réservation incorrect", async () => {
    const reponse = await request(app)
      .patch("/reservations/1")
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        statut: "terminee",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-021 — refuse un identifiant incorrect pour supprimer une réservation", async () => {
    const reponse = await request(app)
      .delete("/reservations/abc")
      .set("Authorization", "Bearer " + jetonVoyageur);

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-022 — refuse de supprimer une réservation absente", async () => {
    const reponse = await request(app)
      .delete("/reservations/999999")
      .set("Authorization", "Bearer " + jetonVoyageur);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-023 — affiche l'état de l'API et sa documentation", async () => {
    const etat = await request(app).get("/health");
    const documentation = await request(app).get("/docs/openapi.json");

    expect(etat.status).toBe(200);
    expect(etat.body).toEqual({
      statut: "ok",
    });

    expect(documentation.status).toBe(200);
    expect(documentation.body.openapi).toBe("3.0.0");
  });

  it("TA-024 — affiche les hôtels et les chambres", async () => {
    const hotels = await request(app).get("/hotels");

    expect(hotels.status).toBe(200);
    expect(hotels.body.length).toBeGreaterThan(0);

    const hotelId = hotels.body[0].id;
    const hotel = await request(app).get("/hotels/" + hotelId);
    const chambresHotel = await request(app).get(
      "/hotels/" + hotelId + "/chambres",
    );
    const chambres = await request(app).get("/chambres");

    expect(hotel.status).toBe(200);
    expect(hotel.body.id).toBe(hotelId);

    expect(chambresHotel.status).toBe(200);
    expect(Array.isArray(chambresHotel.body)).toBe(true);

    expect(chambres.status).toBe(200);
    expect(chambres.body.length).toBeGreaterThan(0);

    const premiereChambre = chambres.body[0];
    const detailChambre = await request(app).get(
      "/chambres/" + premiereChambre.id,
    );

    expect(detailChambre.status).toBe(200);
    expect(detailChambre.body.id).toBe(premiereChambre.id);
  });

  it("TA-025 — cherche des chambres avec des filtres simples", async () => {
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

  it("TA-026 — permet au voyageur et à l'hôtelier de consulter leurs données", async () => {
    const profil = await request(app)
      .get("/me")
      .set("Authorization", "Bearer " + jetonVoyageur);
    const profilVoyageur = await request(app)
      .get("/voyageurs/me")
      .set("Authorization", "Bearer " + jetonVoyageur);
    const reservationsVoyageur = await request(app)
      .get("/reservations/mine")
      .set("Authorization", "Bearer " + jetonVoyageur);
    const reservationsHotelier = await request(app)
      .get("/reservations/received")
      .set("Authorization", "Bearer " + jetonHotelier);

    expect(profil.status).toBe(200);
    expect(profil.body.email).toBe(voyageur.email);

    expect(profilVoyageur.status).toBe(200);
    expect(profilVoyageur.body.role).toBe("voyageur");

    expect(reservationsVoyageur.status).toBe(200);
    expect(Array.isArray(reservationsVoyageur.body)).toBe(true);

    expect(reservationsHotelier.status).toBe(200);
    expect(Array.isArray(reservationsHotelier.body)).toBe(true);
  });

  it("TA-027 — refuse une connexion pour un compte inexistant", async () => {
    const reponse = await request(app).post("/auth/login").send({
      email: "compte-inexistant@example.test",
      motDePasse: "mot-de-passe-valide",
    });

    expect(reponse.status).toBe(401);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-028 — refuse un profil quand le compte du jeton n'existe plus", async () => {
    const jeton = jwt.sign(
      {
        id: 999999,
        email: "absent@example.test",
        role: "voyageur",
        hotelId: null,
      },
      process.env.JWT_SECRET ?? "dev-secret",
    );

    const profil = await request(app)
      .get("/me")
      .set("Authorization", "Bearer " + jeton);
    const profilVoyageur = await request(app)
      .get("/voyageurs/me")
      .set("Authorization", "Bearer " + jeton);

    expect(profil.status).toBe(404);
    expect(profil.body).toHaveProperty("erreur");

    expect(profilVoyageur.status).toBe(404);
    expect(profilVoyageur.body).toHaveProperty("erreur");
  });

  it("TA-029 — refuse une modification de profil incorrecte", async () => {
    const reponse = await request(app)
      .patch("/voyageurs/me")
      .set("Authorization", "Bearer " + jetonVoyageur)
      .send({
        telephone: "12",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-030 — refuse la gestion des chambres sans hôtel associé", async () => {
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

  it("TA-031 — refuse de modifier ou supprimer la chambre d'un autre hôtel", async () => {
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
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        prixNuit: chambreAutreHotel.prixNuit,
      });
    const suppression = await request(app)
      .delete("/chambres/" + chambreAutreHotel.id)
      .set("Authorization", "Bearer " + jetonHotelier);

    expect(modification.status).toBe(403);
    expect(modification.body).toHaveProperty("erreur");

    expect(suppression.status).toBe(403);
    expect(suppression.body).toHaveProperty("erreur");
  });

  it("TA-032 — refuse de supprimer une chambre qui a des réservations", async () => {
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
      .set("Authorization", "Bearer " + jetonHotelier);

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-033 — refuse les changements de réservation sans hôtel associé", async () => {
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

  it("TA-034 — refuse la modification d'une réservation d'un autre hôtel", async () => {
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
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        statut: "confirmee",
      });

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-035 — refuse une transition de réservation interdite", async () => {
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
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({
        statut: "refusee",
      });

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-036 — refuse d'annuler la réservation d'un autre voyageur", async () => {
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
      .set("Authorization", "Bearer " + jetonVoyageur);

    expect(reponse.status).toBe(403);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-037 — refuse d'annuler une réservation déjà terminée", async () => {
    const reservationAnnulee = await prisma.reservations.findFirst({
      where: {
        compteId: voyageur.id,
        statut: "annulee",
      },
    });

    expect(reservationAnnulee).toBeDefined();

    const reponse = await request(app)
      .delete("/reservations/" + reservationAnnulee.id)
      .set("Authorization", "Bearer " + jetonVoyageur);

    expect(reponse.status).toBe(409);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-038 — accepte une modification de profil avec les données actuelles", async () => {
    const profil = await request(app)
      .get("/voyageurs/me")
      .set("Authorization", "Bearer " + jetonVoyageur);

    expect(profil.status).toBe(200);

    const modification = await request(app)
      .patch("/voyageurs/me")
      .set("Authorization", "Bearer " + jetonVoyageur)
      .send({
        nom: profil.body.nom,
        prenom: profil.body.prenom,
        telephone: profil.body.telephone,
      });

    expect(modification.status).toBe(200);
    expect(modification.body.nom).toBe(profil.body.nom);
    expect(modification.body.prenom).toBe(profil.body.prenom);
    expect(modification.body.telephone).toBe(profil.body.telephone);
  });

  it("TA-039 — accepte une modification de chambre sans changer ses valeurs", async () => {
    const chambre = await prisma.chambres.findFirst({
      where: {
        hotelId: hotelier.hotel_id,
      },
    });

    expect(chambre).toBeDefined();

    const modification = await request(app)
      .patch("/chambres/" + chambre.id)
      .set("Authorization", "Bearer " + jetonHotelier)
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

  it("TA-040 — accepte une modification de chambre vide sans changer ses valeurs", async () => {
    const chambre = await prisma.chambres.findFirst({
      where: {
        hotelId: hotelier.hotel_id,
      },
    });

    expect(chambre).toBeDefined();

    const modification = await request(app)
      .patch("/chambres/" + chambre.id)
      .set("Authorization", "Bearer " + jetonHotelier)
      .send({});

    expect(modification.status).toBe(200);
    expect(modification.body.id).toBe(chambre.id);
    expect(modification.body.prixNuit).toBe(chambre.prixNuit);
  });

  it("TA-041 — inscrit un compte de test puis le supprime", async () => {
    const email = "test-" + randomUUID() + "@example.test";

    try {
      const inscription = await request(app)
        .post("/auth/register")
        .send({
          email,
          motDePasse: "mot-de-passe-test",
          nom: "Test",
          prenom: "API",
          role: "hotelier",
          hotelId: hotelier.hotel_id,
          telephone: "0600000000",
        });

      expect(inscription.status).toBe(201);
      expect(inscription.body.compte.email).toBe(email);
      expect(inscription.body.compte.role).toBe("hotelier");
    } finally {
      await prisma.comptes.deleteMany({
        where: {
          email,
        },
      });
    }
  });
});
