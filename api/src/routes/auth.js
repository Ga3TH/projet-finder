import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import prisma from "../prisma.js";
import { authentifier, exigeRole, validerSchema } from "../middlewares.js";
import {
  schemaLogin,
  schemaRegister,
  schemaUpdateVoyageur,
} from "../schemas.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

router.post("/auth/register", validerSchema(schemaRegister), async (req, res) => {
  const { email, motDePasse, nom, prenom, role, hotelId, telephone } = req.body;
  const emailFinal = String(email ?? "").trim().toLowerCase();

  const compteExistant = await prisma.comptes.findUnique({
    where: { email: emailFinal },
  });

  if (compteExistant) {
    return res.status(409).json({ erreur: "Cet email est déjà utilisé" });
  }

  const compte = await prisma.comptes.create({
    data: {
      email: emailFinal,
      motDePasse: await bcrypt.hash(motDePasse, 10),
      nom: nom ?? "",
      prenom: prenom ?? "",
      role: role ?? "voyageur",
      hotelId: hotelId ? Number(hotelId) : null,
      telephone: telephone ?? null,
    },
  });

  return res.status(201).json({
    message: "Compte créé",
    compte: {
      id: compte.id,
      email: compte.email,
      role: compte.role,
    },
  });
});

router.post("/auth/login", validerSchema(schemaLogin), async (req, res) => {
  const { email, motDePasse } = req.body;
  const emailFinal = String(email ?? "").trim().toLowerCase();

  const compte = await prisma.comptes.findUnique({
    where: { email: emailFinal },
  });

  if (!compte) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, compte.motDePasse);

  if (!motDePasseValide) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  const token = jwt.sign(
    {
      id: compte.id,
      email: compte.email,
      role: compte.role,
      hotelId: compte.hotelId,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  return res.json({
    token,
    compte: {
      id: compte.id,
      email: compte.email,
      role: compte.role,
    },
  });
});

router.get("/me", authentifier, async (req, res) => {
  const compte = await prisma.comptes.findUnique({
    where: { id: Number(req.user.id) },
  });

  if (!compte) {
    return res.status(404).json({ erreur: "Compte introuvable" });
  }

  return res.json({
    id: compte.id,
    email: compte.email,
    role: compte.role,
    nom: compte.nom,
    prenom: compte.prenom,
    telephone: compte.telephone,
  });
});

router.get("/voyageurs/me", authentifier, exigeRole("voyageur"), async (req, res) => {
  const compte = await prisma.comptes.findUnique({
    where: { id: Number(req.user.id) },
  });

  if (!compte) {
    return res.status(404).json({ erreur: "Compte introuvable" });
  }

  return res.json({
    id: compte.id,
    email: compte.email,
    role: compte.role,
    nom: compte.nom,
    prenom: compte.prenom,
    telephone: compte.telephone,
  });
});

router.patch(
  "/voyageurs/me",
  authentifier,
  exigeRole("voyageur"),
  validerSchema(schemaUpdateVoyageur),
  async (req, res) => {
    const { telephone, nom, prenom } = req.body;

    const compte = await prisma.comptes.update({
      where: { id: Number(req.user.id) },
      data: {
        ...(telephone ? { telephone: String(telephone) } : {}),
        ...(nom ? { nom: String(nom) } : {}),
        ...(prenom ? { prenom: String(prenom) } : {}),
      },
    });

    return res.json({
      id: compte.id,
      email: compte.email,
      role: compte.role,
      nom: compte.nom,
      prenom: compte.prenom,
      telephone: compte.telephone,
    });
  },
);

export default router;
