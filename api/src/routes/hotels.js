import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * @openapi
 * /hotels:
 *   get:
 *     tags: [Hôtels]
 *     summary: Lister les hôtels
 *     operationId: listerHotels
 *     responses:
 *       '200':
 *         description: Liste des hôtels.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 */
router.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotels.findMany();
  res.json(hotels);
});

/**
 * @openapi
 * /hotels/{id}:
 *   get:
 *     tags: [Hôtels]
 *     summary: Consulter la fiche d'un hôtel
 *     operationId: obtenirHotel
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de l'hôtel.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Fiche de l'hôtel.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 */
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

/**
 * @openapi
 * /hotels/{id}/chambres:
 *   get:
 *     tags: [Hôtels, Chambres]
 *     summary: Lister les chambres d'un hôtel
 *     operationId: listerChambresHotel
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de l'hôtel.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Liste des chambres de l'hôtel.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chambre'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 */
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

/**
 * @openapi
 * /chambres/{id}:
 *   get:
 *     tags: [Chambres]
 *     summary: Consulter une chambre
 *     operationId: obtenirChambre
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la chambre.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Fiche de la chambre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chambre'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 */
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

/**
 * @openapi
 * /chambres:
 *   get:
 *     tags: [Chambres]
 *     summary: Rechercher des chambres disponibles
 *     description: >-
 *       Tous les critères sont facultatifs. Le filtre de dates est appliqué
 *       lorsque date_debut et date_fin sont tous deux fournis. Le paramètre
 *       prix_max est le nom recommandé ; prixmax reste accepté pour compatibilité.
 *     operationId: rechercherChambres
 *     parameters:
 *       - name: hotel
 *         in: query
 *         required: false
 *         description: Identifiant numérique de l'hôtel ou partie de son nom.
 *         schema:
 *           type: string
 *         example: Amor
 *       - name: date_debut
 *         in: query
 *         required: false
 *         description: Date d'arrivée au format YYYY-MM-DD, à fournir avec date_fin.
 *         schema:
 *           type: string
 *           format: date
 *       - name: date_fin
 *         in: query
 *         required: false
 *         description: Date de départ au format YYYY-MM-DD, à fournir avec date_debut.
 *         schema:
 *           type: string
 *           format: date
 *       - name: capacite
 *         in: query
 *         required: false
 *         description: Capacité exacte de la chambre recherchée.
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: prix_max
 *         in: query
 *         required: false
 *         description: Prix maximal par nuit. L'ancien nom prixmax est également accepté.
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: categorie
 *         in: query
 *         required: false
 *         description: Catégorie de chambre (recherche partielle).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Chambres correspondant aux filtres, avec leur hôtel associé.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Chambre'
 *                   - type: object
 *                     properties:
 *                       hotel:
 *                         $ref: '#/components/schemas/Hotel'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 */
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
