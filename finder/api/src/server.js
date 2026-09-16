import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT ?? 3000;
const prisma = new PrismaClient();

// Middleware pour lire le JSON
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ statut: "ok" });
});

app.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotels.findMany();
  res.json(hotels);
});

app.get("/hotels/:id/chambres", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  const hotel = await prisma.hotels.findUnique({ where: { id } });

  if (!hotel) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  const chambres = await prisma.chambres.findMany({
    where: { hotelId: id },
  });

  res.json(chambres);
});

app.get("/hotels/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json({ erreur: "L'identifiant doit être un entier" });
  }

  const hotel = await prisma.hotels.findUnique({ where: { id } });

  if (!hotel) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  res.json(hotel);
});

app.get("/chambres/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json({ erreur: "L'identifiant doit être un entier" });
  }

  const chambre = await prisma.chambres.findUnique({ where: { id } });

  if (!chambre) {
    return res.status(404).json({ erreur: "Chambre introuvable" });
  }

  res.json(chambre);
});

app.get("/chambres", async (req, res) => {
  const { prix_max } = req.query;
  if (prix_max === undefined) {
    return res.json(await prisma.chambres.findMany());
  }

  const prixMaximum = Number(prix_max);
  if (!Number.isFinite(prixMaximum) || prixMaximum < 0) {
    return res.status(400).json({
      erreur: "Le prix maximum doit être un nombre positif ou nul",
    });
  }

  const chambres = await prisma.chambres.findMany({
    where: { prixNuit: { lte: prixMaximum } },
  });
  res.json(chambres);
});

export { app };

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
}
