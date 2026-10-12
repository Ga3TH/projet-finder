import { Router } from "express";
import prisma from "../prisma.js";
import {
  authentifier,
  exigeRole,
  transitionReservationAutorisee,
  validerSchema,
} from "../middlewares.js";
import { schemaReservation, schemaUpdateReservation } from "../schemas.js";

const router = Router();

/**
 * @openapi
 * /reservations/mine:
 *   get:
 *     tags: [Réservations]
 *     summary: Lister les réservations du voyageur connecté
 *     operationId: listerMesReservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Réservations du voyageur connecté.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 */
router.get("/reservations/mine", authentifier, exigeRole("voyageur"), async (req, res) => {
  const reservations = await prisma.reservations.findMany({
    where: { compteId: Number(req.user.id) },
  });

  return res.json(reservations);
});

/**
 * @openapi
 * /reservations/received:
 *   get:
 *     tags: [Réservations]
 *     summary: Lister les réservations reçues par l'hôtelier connecté
 *     operationId: listerReservationsRecues
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Réservations des chambres de l'hôtel de l'hôtelier.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 */
router.get(
  "/reservations/received",
  authentifier,
  exigeRole("hotelier"),
  async (req, res) => {
    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res.status(403).json({ erreur: "Aucun hôtel associé à ce compte" });
    }

    const reservations = await prisma.reservations.findMany({
      where: { chambre: { hotelId: Number(req.user.hotelId) } },
    });

    return res.json(reservations);
  },
);

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags: [Réservations]
 *     summary: Réserver une chambre
 *     description: Le statut initial de la réservation est en_attente.
 *     operationId: creerReservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationCreation'
 *     responses:
 *       '201':
 *         description: Réservation créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 */
router.post(
  "/reservations",
  authentifier,
  exigeRole("voyageur"),
  validerSchema(schemaReservation),
  async (req, res) => {
    const { chambreId, dateDebut, dateFin } = req.body;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return res.status(400).json({ erreur: "Dates invalides" });
    }

    if (debut >= fin) {
      return res.status(400).json({
        erreur: "dateDebut doit être strictement avant dateFin",
      });
    }

    const chambre = await prisma.chambres.findUnique({
      where: { id: chambreId },
    });

    if (!chambre) {
      return res.status(404).json({ erreur: "Chambre introuvable" });
    }

    const reservation = await prisma.reservations.create({
      data: {
        chambreId,
        compteId: Number(req.user.id),
        dateDebut: debut,
        dateFin: fin,
        statut: "en_attente",
      },
    });

    return res.status(201).json(reservation);
  },
);

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     tags: [Réservations]
 *     summary: Accepter ou refuser une réservation de son hôtel
 *     operationId: modifierStatutReservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la réservation.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationModification'
 *     responses:
 *       '200':
 *         description: Statut de la réservation modifié.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *       '409':
 *         $ref: '#/components/responses/Erreur409'
 */
router.patch(
  "/reservations/:id",
  authentifier,
  exigeRole("hotelier"),
  validerSchema(schemaUpdateReservation),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
      include: { chambre: { select: { hotelId: true } } },
    });

    if (!reservation) {
      return res.status(404).json({ erreur: "Réservation introuvable" });
    }

    if (
      req.user.hotelId === null ||
      req.user.hotelId === undefined ||
      reservation.chambre.hotelId !== Number(req.user.hotelId)
    ) {
      return res.status(403).json({
        erreur: "Vous ne pouvez modifier que les réservations de votre hôtel",
      });
    }

    if (!transitionReservationAutorisee(reservation.statut, req.body.statut)) {
      return res.status(409).json({ erreur: "Transition de statut interdite" });
    }

    const reservationMiseAJour = await prisma.reservations.update({
      where: { id },
      data: { statut: req.body.statut },
    });

    return res.json(reservationMiseAJour);
  },
);

/**
 * @openapi
 * /reservations/{id}:
 *   delete:
 *     tags: [Réservations]
 *     summary: Annuler sa réservation
 *     operationId: annulerReservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la réservation.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Réservation annulée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *       '409':
 *         $ref: '#/components/responses/Erreur409'
 */
router.delete(
  "/reservations/:id",
  authentifier,
  exigeRole("voyageur"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({ erreur: "Réservation introuvable" });
    }

    if (reservation.compteId !== Number(req.user.id)) {
      return res.status(403).json({
        erreur: "Vous ne pouvez annuler que vos propres réservations",
      });
    }

    if (!["en_attente", "confirmee"].includes(reservation.statut)) {
      return res.status(409).json({ erreur: "Annulation impossible" });
    }

    const reservationAnnulee = await prisma.reservations.update({
      where: { id },
      data: { statut: "annulee" },
    });

    return res.json(reservationAnnulee);
  },
);

export default router;
