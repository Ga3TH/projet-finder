import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotels.findMany();
  res.json(hotels);
});

router.get("/hotels/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'identifiant doit être un entier" });
  }

  const hotel = await prisma.hotels.findUnique({ where: { id } });

  if (!hotel) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  return res.json(hotel);
});

router.get("/hotels/:id/chambres", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  const hotel = await prisma.hotels.findUnique({ where: { id } });

  if (!hotel) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  const chambres = await prisma.chambres.findMany({ where: { hotelId: id } });
  return res.json(chambres);
});

router.get("/chambres/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'identifiant doit être un entier" });
  }

  const chambre = await prisma.chambres.findUnique({ where: { id } });

  if (!chambre) {
    return res.status(404).json({ erreur: "Chambre introuvable" });
  }

  return res.json(chambre);
});

router.get("/chambres", async (req, res) => {
  const { hotel, categorie, capacite, date_debut, date_fin } = req.query;
  const prixMaximal = req.query.prix_max ?? req.query.prixmax;
  const filtre = {};

  if (hotel) {
    if (!Number.isNaN(Number(hotel))) {
      filtre.hotelId = Number(hotel);
    } else {
      filtre.hotel = { nom: { contains: String(hotel) } };
    }
  }

  if (prixMaximal) {
    filtre.prixNuit = { lte: Number(prixMaximal) };
  }

  if (categorie) {
    filtre.categorie = { contains: String(categorie) };
  }

  if (capacite) {
    filtre.capacite = { equals: Number(capacite) };
  }

  if (date_debut && date_fin) {
    const debut = new Date(String(date_debut));
    const fin = new Date(String(date_fin));

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return res.status(400).json({ erreur: "Dates invalides" });
    }

    if (debut >= fin) {
      return res.status(400).json({
        erreur: "date_debut doit être strictement avant date_fin",
      });
    }

    filtre.reservations = {
      none: {
        statut: { equals: "confirmee" },
        dateDebut: { lt: fin },
        dateFin: { gt: debut },
      },
    };
  }

  const chambres = await prisma.chambres.findMany({
    where: filtre,
    include: { hotel: true },
  });

  return res.json(chambres);
});

export default router;
