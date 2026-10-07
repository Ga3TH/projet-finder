import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, prisma, comptes, voyageur, hotelier, jetons, initialiserTests } from "./helpers.js";
import { randomUUID } from "node:crypto";

describe("Etat et documentation", () => {
  initialiserTests();

  it("TA-001 — affiche l'état de l'API", async () => {
    const reponse = await request(app).get("/health");

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual({ statut: "ok" });
  });

  it("Complement 23 — affiche l'état de l'API et sa documentation", async () => {
    const etat = await request(app).get("/health");
    const documentation = await request(app).get("/docs/openapi.json");

    expect(etat.status).toBe(200);
    expect(etat.body).toEqual({
      statut: "ok",
    });

    expect(documentation.status).toBe(200);
    expect(documentation.body.openapi).toBe("3.0.0");
  });
});
