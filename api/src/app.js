import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import prisma from "./prisma.js";
import indexRouter from "./routes/index.js";
import hotelsRouter from "./routes/hotels.js";
import authRouter from "./routes/auth.js";
import reservationsRouter from "./routes/reservations.js";
import chambresRouter from "./routes/chambres.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Finder",
      version: "1.0.0",
      description:
        "API de réservation de chambres d'hôtel pour Amor, Byzance et Caraïbes.",
    },
    servers: [{ url: `http://localhost:${PORT}`, description: "Serveur local" }],
    tags: [
      { name: "Système", description: "État de l'API" },
      { name: "Hôtels", description: "Consultation des hôtels" },
      { name: "Chambres", description: "Recherche et gestion des chambres" },
      { name: "Authentification", description: "Inscription et connexion" },
      { name: "Profil", description: "Compte connecté" },
      { name: "Voyageurs", description: "Profil voyageur" },
      { name: "Réservations", description: "Création et gestion des réservations" },
      { name: "Administration", description: "Routes d'administration" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Coller le JWT obtenu avec POST /auth/login.",
        },
      },
    },
  },
  apis: [path.join(path.dirname(fileURLToPath(import.meta.url)), "openapi.js")],
});

app.get("/docs/openapi.json", (req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(indexRouter);
app.use(hotelsRouter);
app.use(authRouter);
app.use(reservationsRouter);
app.use(chambresRouter);
app.use(adminRouter);

export { app, prisma };
