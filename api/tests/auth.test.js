import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma, comptes, voyageur, hotelier, jetons, initialiserTests } from "./helpers.js";
import { randomUUID } from "node:crypto";

describe("Authentification et profils", () => {
  initialiserTests();

  it("TA-005 — crée un compte sans renvoyer son mot de passe", async () => {
    const email = "recette-" + randomUUID() + "@example.test";

    try {
      const reponse = await request(app).post("/auth/register").send({
        email,
        motDePasse: "mot-de-passe-test",
        nom: "Recette",
        prenom: "Test",
      });

      expect(reponse.status).toBe(201);
      expect(reponse.body.compte.email).toBe(email);
      expect(reponse.body.compte).not.toHaveProperty("motDePasse");
      expect(reponse.body.compte).not.toHaveProperty("mot_de_passe_clair");
    } finally {
      await prisma.comptes.deleteMany({ where: { email } });
    }
  });

  it("TA-006 — se connecte puis ouvre son profil avec le jeton", async () => {
    const connexion = await request(app).post("/auth/login").send({
      email: voyageur.email,
      motDePasse: voyageur.mot_de_passe_clair,
    });

    expect(connexion.status).toBe(200);
    expect(typeof connexion.body.token).toBe("string");

    const profil = await request(app)
      .get("/me")
      .set("Authorization", "Bearer " + connexion.body.token);

    expect(profil.status).toBe(200);
    expect(profil.body.email).toBe(voyageur.email);
  });

  it("Complement 05 — refuse une inscription incorrecte ou déjà utilisée", async () => {
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

  it("Complement 06 — refuse une connexion avec des identifiants incorrects", async () => {
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

  it("Complement 07 — refuse l'accès aux routes privées sans jeton", async () => {
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

  it("Complement 08 — refuse un jeton invalide", async () => {
    const reponse = await request(app)
      .get("/me")
      .set("Authorization", "Bearer jeton-invalide");

    expect(reponse.status).toBe(401);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 09 — refuse l'accès si le rôle ne convient pas", async () => {
    const voyageurSurRouteHotelier = await request(app)
      .get("/reservations/received")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    const hotelierSurRouteVoyageur = await request(app)
      .get("/reservations/mine")
      .set("Authorization", "Bearer " + jetons.jetonHotelier);

    const chambrePourUnAutreHotel = await request(app)
      .post("/chambres")
      .set("Authorization", "Bearer " + jetons.jetonHotelier)
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

  it("Complement 27 — refuse une connexion pour un compte inexistant", async () => {
    const reponse = await request(app).post("/auth/login").send({
      email: "compte-inexistant@example.test",
      motDePasse: "mot-de-passe-valide",
    });

    expect(reponse.status).toBe(401);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 28 — refuse un profil quand le compte du jeton n'existe plus", async () => {
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

  it("Complement 29 — refuse une modification de profil incorrecte", async () => {
    const reponse = await request(app)
      .patch("/voyageurs/me")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
      .send({
        telephone: "12",
      });

    expect(reponse.status).toBe(400);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 38 — accepte une modification de profil avec les données actuelles", async () => {
    const profil = await request(app)
      .get("/voyageurs/me")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur);

    expect(profil.status).toBe(200);

    const modification = await request(app)
      .patch("/voyageurs/me")
      .set("Authorization", "Bearer " + jetons.jetonVoyageur)
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

  it("Complement 41 — inscrit un compte de test puis le supprime", async () => {
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
