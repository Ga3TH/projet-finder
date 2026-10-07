import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma, comptes, voyageur, hotelier, jetons, initialiserTests } from "./helpers.js";
import { randomUUID } from "node:crypto";

describe("Hotels", () => {
  initialiserTests();

  it("TA-002 — affiche les trois hôtels", async () => {
    const reponse = await request(app).get("/hotels");

    expect(reponse.status).toBe(200);
    expect(Array.isArray(reponse.body)).toBe(true);
    expect(reponse.body).toHaveLength(3);
  });

  it("TA-003 — affiche un hôtel existant et refuse un hôtel absent", async () => {
    const hotel = await request(app).get("/hotels/1");
    const hotelAbsent = await request(app).get("/hotels/999");

    expect(hotel.status).toBe(200);
    expect(hotel.body.id).toBe(1);
    expect(hotelAbsent.status).toBe(404);
    expect(hotelAbsent.body).toHaveProperty("erreur");
  });

  it("Complement 01 — refuse un identifiant d'hôtel invalide ou absent", async () => {
    const idInvalide = await request(app).get("/hotels/invalide");
    const hotelAbsent = await request(app).get("/hotels/999999");

    expect(idInvalide.status).toBe(400);
    expect(idInvalide.body).toHaveProperty("erreur");

    expect(hotelAbsent.status).toBe(404);
    expect(hotelAbsent.body).toHaveProperty("erreur");
  });

  it("Complement 02 — refuse les chambres d'un hôtel absent", async () => {
    const reponse = await request(app).get("/hotels/999999/chambres");

    expect(reponse.status).toBe(404);
    expect(reponse.body).toHaveProperty("erreur");
  });

  it("Complement 24 — affiche les hôtels et les chambres", async () => {
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
});
