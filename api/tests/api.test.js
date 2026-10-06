import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "../src/app.js";

const comptes = JSON.parse(
  readFileSync(new URL("../finder-data/comptes.json", import.meta.url), "utf8"),
);
const voyageur = comptes.find((compte) => compte.role === "voyageur");
const hotelier = comptes.find((compte) => compte.role === "hotelier");

let jetonVoyageur;
let jetonHotelier;

async function connecter(compte) {
  const reponse = await request(app).post("/auth/login").send({
    email: compte.email,
    motDePasse: compte.mot_de_passe_clair,
  });

  expect(reponse.status).toBe(200);
  expect(reponse.body.token).toEqual(expect.any(String));
  return reponse.body.token;
}

async function requeteAuthentifiee(methode, chemin, jeton, corps) {
  let requete = request(app)[methode](chemin).set(
    "Authorization",
    `Bearer ${jeton}`,
  );
  if (corps !== undefined) requete = requete.send(corps);
  return requete;
}

describe("TA-001 à TA-010 — erreurs HTTP de l'API Finder", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const [nombreHotels, nombreChambres, nombreComptes] = await Promise.all([
      prisma.hotels.count(),
      prisma.chambres.count(),
      prisma.comptes.count(),
    ]);

    if (nombreHotels < 3 || nombreChambres < 32 || nombreComptes < 8) {
      throw new Error(
        "La base DATABASE_URL ne contient pas les données de démonstration. " +
          "Les tests n'ont rien modifié. Charge le seed dans une base de test.",
      );
    }

    [jetonVoyageur, jetonHotelier] = await Promise.all([
      connecter(voyageur),
      connecter(hotelier),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("TA-001 — renvoie 400 ou 404 pour une fiche hôtel", async () => {
    const identifiantInvalide = await request(app).get("/hotels/invalide");
    const hotelAbsent = await request(app).get("/hotels/999999");

    expect(identifiantInvalide.status).toBe(400);
    expect(identifiantInvalide.body).toHaveProperty("erreur");
    expect(hotelAbsent.status).toBe(404);
    expect(hotelAbsent.body).toHaveProperty("erreur");
  });

  it("TA-002 — renvoie 404 pour les chambres d'un hôtel inexistant", async () => {
    const reponse = await request(app).get("/hotels/999999/chambres");

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("TA-003 — renvoie 400 ou 404 pour une chambre", async () => {
    const identifiantInvalide = await request(app).get("/chambres/invalide");
    const chambreAbsente = await request(app).get("/chambres/999999");

    expect(identifiantInvalide.status).toBe(400);
    expect(identifiantInvalide.body).toHaveProperty("erreur");
    expect(chambreAbsente.status).toBe(404);
    expect(chambreAbsente.body).toHaveProperty("erreur");
  });

  it("TA-004 — rejette les dates incorrectes de la recherche", async () => {
    const dateInvalide = await request(app).get(
      "/chambres?date_debut=pas-une-date&date_fin=2099-06-12",
    );
    const ordreInvalide = await request(app).get(
      "/chambres?date_debut=2099-06-12&date_fin=2099-06-10",
    );

    expect(dateInvalide.status).toBe(400);
    expect(dateInvalide.body).toHaveProperty("erreur");
    expect(ordreInvalide.status).toBe(400);
    expect(ordreInvalide.body).toHaveProperty("erreur");
  });

  it("TA-005 — rejette un corps invalide et un e-mail déjà inscrit", async () => {
    const corpsInvalide = await request(app)
      .post("/auth/register")
      .send({ email: "pas-un-email", motDePasse: "court" });
    const doublon = await request(app).post("/auth/register").send({
      email: voyageur.email,
      motDePasse: voyageur.mot_de_passe_clair,
    });

    expect(corpsInvalide.status).toBe(400);
    expect(corpsInvalide.body).toHaveProperty("erreur");
    expect(doublon.status).toBe(409);
    expect(doublon.body).toHaveProperty("erreur");
  });

  it("TA-006 — rejette les identifiants invalides à la connexion", async () => {
    const corpsInvalide = await request(app)
      .post("/auth/login")
      .send({ email: "pas-un-email" });
    const mauvaisMotDePasse = await request(app).post("/auth/login").send({
      email: voyageur.email,
      motDePasse: "mot-de-passe-incorrect",
    });

    expect(corpsInvalide.status).toBe(400);
    expect(corpsInvalide.body).toHaveProperty("erreur");
    expect(mauvaisMotDePasse.status).toBe(401);
    expect(mauvaisMotDePasse.body).toHaveProperty("erreur");
  });

  it("TA-007 — renvoie 401 sans jeton sur les routes protégées", async () => {
    const reponses = await Promise.all([
      request(app).get("/me"),
      request(app).get("/voyageurs/me"),
      request(app).patch("/voyageurs/me").send({ nom: "Test" }),
      request(app).get("/reservations/mine"),
      request(app).get("/reservations/received"),
      request(app).post("/reservations").send({}),
      request(app).patch("/reservations/1").send({ statut: "confirmee" }),
      request(app).delete("/reservations/1"),
      request(app).post("/chambres").send({}),
      request(app).patch("/chambres/1").send({ prixNuit: 100 }),
      request(app).delete("/chambres/1"),
      request(app).get("/admin/secret"),
    ]);

    for (const reponse of reponses) {
      expect(reponse.status).toBe(401);
      expect(reponse.body).toHaveProperty("erreur");
    }
  });

  it("TA-008 — renvoie 403 quand le rôle ne permet pas la route", async () => {
    const voyageurSurRouteHotelier = await requeteAuthentifiee(
      "get",
      "/reservations/received",
      jetonVoyageur,
    );
    const hotelierSurRouteVoyageur = await requeteAuthentifiee(
      "get",
      "/reservations/mine",
      jetonHotelier,
    );
    const chambreAutreHotel = await requeteAuthentifiee(
      "post",
      "/chambres",
      jetonHotelier,
      {
        hotelId: 2,
        numero: 9999,
        categorie: "test",
        capacite: 1,
        prixNuit: 50,
      },
    );

    for (const reponse of [
      voyageurSurRouteHotelier,
      hotelierSurRouteVoyageur,
      chambreAutreHotel,
    ]) {
      expect(reponse.status).toBe(403);
      expect(reponse.body).toHaveProperty("erreur");
    }
  });

  it("TA-009 — rejette les corps et ressources invalides pour une réservation", async () => {
    const corpsInvalide = await requeteAuthentifiee(
      "post",
      "/reservations",
      jetonVoyageur,
      { chambreId: "texte", dateDebut: "", dateFin: "" },
    );
    const chambreAbsente = await requeteAuthentifiee(
      "post",
      "/reservations",
      jetonVoyageur,
      {
        chambreId: 999999,
        dateDebut: "2099-06-10",
        dateFin: "2099-06-12",
      },
    );

    expect(corpsInvalide.status).toBe(400);
    expect(corpsInvalide.body).toHaveProperty("erreur");
    expect(chambreAbsente.status).toBe(404);
    expect(chambreAbsente.body).toHaveProperty("erreur");
  });

  it("TA-010 — rejette les chambres et réservations inconnues ou mal formées", async () => {
    const creationChambreInvalide = await requeteAuthentifiee(
      "post",
      "/chambres",
      jetonHotelier,
      { hotelId: -1 },
    );
    const modificationChambreInvalide = await requeteAuthentifiee(
      "patch",
      "/chambres/abc",
      jetonHotelier,
      { prixNuit: -1 },
    );
    const chambreAbsente = await requeteAuthentifiee(
      "delete",
      "/chambres/999999",
      jetonHotelier,
    );
    const statutInvalide = await requeteAuthentifiee(
      "patch",
      "/reservations/1",
      jetonHotelier,
      { statut: "terminee" },
    );
    const reservationAbsente = await requeteAuthentifiee(
      "patch",
      "/reservations/999999",
      jetonHotelier,
      { statut: "confirmee" },
    );

    for (const reponse of [
      creationChambreInvalide,
      modificationChambreInvalide,
      statutInvalide,
    ]) {
      expect(reponse.status).toBe(400);
      expect(reponse.body).toHaveProperty("erreur");
    }
    expect(chambreAbsente.status).toBe(404);
    expect(chambreAbsente.body).toHaveProperty("erreur");
    expect(reservationAbsente.status).toBe(404);
    expect(reservationAbsente.body).toHaveProperty("erreur");
  });
});