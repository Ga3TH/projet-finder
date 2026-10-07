import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect } from "vitest";
import request from "supertest";
import { app, prisma } from "../src/app.js";

// it() crée un test, expect() vérifie son résultat et beforeAll()/afterAll() préparent puis ferment la connexion.
export { app, prisma };

export const comptes = JSON.parse(
  readFileSync(new URL("../finder-data/comptes.json", import.meta.url), "utf8"),
);

export const voyageur = comptes.find((compte) => compte.role === "voyageur");
export const hotelier = comptes.find((compte) => compte.role === "hotelier");

export const jetons = { jetonVoyageur: undefined, jetonHotelier: undefined };

export function initialiserTests() {
  beforeAll(async () => {
    await prisma.$connect();
    const nombreHotels = await prisma.hotels.count();
    const nombreChambres = await prisma.chambres.count();
    const nombreComptes = await prisma.comptes.count();

    if (nombreHotels < 3 || nombreChambres < 32 || nombreComptes < 8) {
      throw new Error(
        "La base DATABASE_URL ne contient pas les donnees de demonstration. " +
          "Charge le seed dans une base de test.",
      );
    }

    const connexionVoyageur = await request(app).post("/auth/login").send({
      email: voyageur.email,
      motDePasse: voyageur.mot_de_passe_clair,
    });
    expect(connexionVoyageur.status).toBe(200);
    expect(connexionVoyageur.body.token).toEqual(expect.any(String));
    jetons.jetonVoyageur = connexionVoyageur.body.token;

    const connexionHotelier = await request(app).post("/auth/login").send({
      email: hotelier.email,
      motDePasse: hotelier.mot_de_passe_clair,
    });
    expect(connexionHotelier.status).toBe(200);
    expect(connexionHotelier.body.token).toEqual(expect.any(String));
    jetons.jetonHotelier = connexionHotelier.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  return jetons;
}
