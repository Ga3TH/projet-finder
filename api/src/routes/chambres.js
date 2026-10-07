import { Router } from "express";
import prisma from "../prisma.js";
import { authentifier, exigeRole, validerSchema } from "../middlewares.js";
import { schemaChambre, schemaUpdateChambre } from "../schemas.js";

const router = Router();

router.post(
  "/chambres",
  authentifier,
  exigeRole("hotelier"),
  validerSchema(schemaChambre),
  async (req, res) => {
    const { hotelId, numero, categorie, capacite, prixNuit, description, disponible } = req.body;

    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res.status(403).json({ erreur: "Aucun hôtel associé à ce compte" });
    }

    if (Number(hotelId) !== Number(req.user.hotelId)) {
      return res.status(403).json({
        erreur: "Vous ne pouvez modifier que les chambres de votre hôtel",
      });
    }

    const chambre = await prisma.chambres.create({
      data: {
        hotelId: Number(hotelId),
        numero: Number(numero),
        categorie: String(categorie),
        capacite: Number(capacite),
        prixNuit: Number(prixNuit),
        description: description ? String(description) : "",
        disponible: disponible ?? true,
      },
    });

    return res.status(201).json(chambre);
  },
);

router.patch(
  "/chambres/:id",
  authentifier,
  exigeRole("hotelier"),
  validerSchema(schemaUpdateChambre),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res.status(403).json({ erreur: "Aucun hôtel associé à ce compte" });
    }

    const chambreExistante = await prisma.chambres.findUnique({
      where: { id },
    });

    if (!chambreExistante) {
      return res.status(404).json({ erreur: "Chambre introuvable" });
    }

    if (chambreExistante.hotelId !== Number(req.user.hotelId)) {
      return res.status(403).json({
        erreur: "Vous ne pouvez modifier que les chambres de votre hôtel",
      });
    }

    const chambre = await prisma.chambres.update({
      where: { id },
      data: {
        ...(req.body.numero !== undefined ? { numero: Number(req.body.numero) } : {}),
        ...(req.body.categorie !== undefined ? { categorie: String(req.body.categorie) } : {}),
        ...(req.body.capacite !== undefined ? { capacite: Number(req.body.capacite) } : {}),
        ...(req.body.prixNuit !== undefined ? { prixNuit: Number(req.body.prixNuit) } : {}),
        ...(req.body.description !== undefined ? { description: String(req.body.description) } : {}),
        ...(req.body.disponible !== undefined ? { disponible: Boolean(req.body.disponible) } : {}),
      },
    });

    return res.json(chambre);
  },
);

router.delete(
  "/chambres/:id",
  authentifier,
  exigeRole("hotelier"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res.status(403).json({ erreur: "Aucun hôtel associé à ce compte" });
    }

    const chambre = await prisma.chambres.findUnique({ where: { id } });

    if (!chambre) {
      return res.status(404).json({ erreur: "Chambre introuvable" });
    }

    if (chambre.hotelId !== Number(req.user.hotelId)) {
      return res.status(403).json({
        erreur: "Vous ne pouvez modifier que les chambres de votre hôtel",
      });
    }

    const reservations = await prisma.reservations.count({
      where: { chambreId: id },
    });

    if (reservations > 0) {
      return res.status(409).json({
        erreur: "Impossible de supprimer une chambre avec des réservations",
      });
    }

    const chambreSupprimee = await prisma.chambres.delete({ where: { id } });
    return res.json(chambreSupprimee);
  },
);

export default router;
