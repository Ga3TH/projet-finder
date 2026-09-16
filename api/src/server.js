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
  const {
    hotel,
    prixmax,
    categorie,
    capacite,
    date_debut,
    date_fin
  } = req.query;

  const filtre = {};

  if (hotel) {
    if (!Number.isNaN(Number(hotel))) {
      filtre.hotelId = Number(hotel);
    } 
    else {
      filtre.hotel = { nom: { contains: String(hotel) } };
    }
  }
  if (prixmax) filtre.prixNuit = { 
    lte: Number(prixmax) 
  };
  if (categorie) filtre.categorie = { 
    contains: String(categorie) 
  };
  if (capacite) filtre.capacite = {
    equals: Number(capacite)
  };

  if (date_debut && date_fin) {
    const debut = new Date(String(date_debut));
    const fin = new Date(String(date_fin));

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return res.status(400).json({ erreur: "Dates invalides" });
    }

    if (debut >= fin) {
      return res.status(400).json({
        erreur: "date_debut doit être strictement avant date_fin"
      });
    }

    filtre.reservations = {
      none: {
        statut: "confirmee",
        dateDebut: { lt: fin },
        dateFin: { gt: debut }
      }
    };
  }

  const chambres = await prisma.chambres.findMany({
    where: filtre,
    include: {
      hotel: true
    }
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