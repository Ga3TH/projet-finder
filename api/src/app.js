import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const prisma = new PrismaClient();

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

const schemaRegister = z
  .object({
    email: z.string().email(),
    motDePasse: z.string().min(6),
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    role: z.enum(["voyageur", "hotelier", "admin"]).optional(),
    hotelId: z.number().int().positive().optional(),
    telephone: z.string().optional(),
  })
  .strict();

const schemaLogin = z
  .object({
    email: z.string().email(),
    motDePasse: z.string().min(6),
  })
  .strict();

const schemaUpdateVoyageur = z
  .object({
    telephone: z.string().min(6).optional(),
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
  })
  .partial()
  .strict();

const schemaChambre = z
  .object({
    hotelId: z.number().int().positive(),
    numero: z.number().int().positive(),
    categorie: z.string().min(1),
    capacite: z.number().int().positive(),
    prixNuit: z.number().int().nonnegative(),
    description: z.string().optional(),
    disponible: z.boolean().optional(),
  })
  .strict();

const schemaUpdateChambre = schemaChambre.partial().strict();

const schemaReservation = z
  .object({
    chambreId: z.number().int().positive(),
    dateDebut: z.string().min(1),
    dateFin: z.string().min(1),
  })
  .strict();

const schemaUpdateReservation = z
  .object({
    statut: z.enum(["en_attente", "confirmee", "refusee", "annulee"]),
  })
  .strict();

const TRANSITIONS_AUTORISEES = {
  en_attente: ["confirmee", "refusee"],
  confirmee: [],
  refusee: [],
  annulee: [],
};

function transitionReservationAutorisee(statutActuel, statutVoulu) {
  return (TRANSITIONS_AUTORISEES[statutActuel] ?? []).includes(statutVoulu);
}

// MiddleWare de validation de schéma

function validerSchema(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body);

    if (!resultat.success) {
      const details = resultat.error.issues.map((erreur) => ({
        chemin: erreur.path.join(".") || "corps",
        message: erreur.message,
      }));

      return res.status(400).json({
        erreur: "Corps invalide",
        details,
      });
    }

    req.body = resultat.data;
    return next();
  };
}

function authentifier(req, res, next) {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ erreur: "Jeton absent ou invalide" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    req.utilisateur = payload;
    return next();
  } catch {
    return res.status(401).json({ erreur: "Jeton invalide" });
  }
}

function exigeRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erreur: "Authentification requise" });
    }

    if (rolesAutorises.length > 0 && !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ erreur: "Rôle insuffisant" });
    }

    return next();
  };
}

// routes publiques

app.get("/health", (req, res) => {
  res.json({ statut: "ok" });
});

app.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotels.findMany();
  res.json(hotels);
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

  return res.json(hotel);
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

  const chambres = await prisma.chambres.findMany({ where: { hotelId: id } });
  return res.json(chambres);
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

  return res.json(chambre);
});

app.get("/chambres", async (req, res) => {
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

// incription

app.post("/auth/register", validerSchema(schemaRegister), async (req, res) => {
  const { email, motDePasse, nom, prenom, role, hotelId, telephone } = req.body;
  const emailFinal = String(email ?? "")
    .trim()
    .toLowerCase();

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

// connexion

app.post("/auth/login", validerSchema(schemaLogin), async (req, res) => {
  const { email, motDePasse } = req.body;
  const emailFinal = String(email ?? "")
    .trim()
    .toLowerCase();

  const compte = await prisma.comptes.findUnique({
    where: { email: emailFinal },
  });

  if (!compte) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  const motDePasseValide = await bcrypt.compare(
    motDePasse,
    compte.motDePasse,
  );

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

// register

app.get("/me", authentifier, async (req, res) => {
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

app.get(
  "/voyageurs/me",
  authentifier,
  exigeRole("voyageur"),
  async (req, res) => {
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
  },
);

app.patch(
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

app.get(
  "/reservations/mine",
  authentifier,
  exigeRole("voyageur"),
  async (req, res) => {
    const reservations = await prisma.reservations.findMany({
      where: { compteId: Number(req.user.id) },
    });

    return res.json(reservations);
  },
);

app.get(
  "/reservations/received",
  authentifier,
  exigeRole("hotelier"),
  async (req, res) => {
    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res
        .status(403)
        .json({ erreur: "Aucun hôtel associé à ce compte" });
    }

    const reservations = await prisma.reservations.findMany({
      where: { chambre: { hotelId: Number(req.user.hotelId) } },
    });

    return res.json(reservations);
  },
);

app.post(
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

app.patch(
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
      return res
        .status(403)
        .json({
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

app.delete(
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

app.post(
  "/chambres",
  authentifier,
  exigeRole("hotelier"),
  validerSchema(schemaChambre),
  async (req, res) => {
    const {
      hotelId,
      numero,
      categorie,
      capacite,
      prixNuit,
      description,
      disponible,
    } = req.body;

    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res
        .status(403)
        .json({ erreur: "Aucun hôtel associé à ce compte" });
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

app.patch(
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
      return res
        .status(403)
        .json({ erreur: "Aucun hôtel associé à ce compte" });
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
        ...(req.body.numero !== undefined
          ? { numero: Number(req.body.numero) }
          : {}),
        ...(req.body.categorie !== undefined
          ? { categorie: String(req.body.categorie) }
          : {}),
        ...(req.body.capacite !== undefined
          ? { capacite: Number(req.body.capacite) }
          : {}),
        ...(req.body.prixNuit !== undefined
          ? { prixNuit: Number(req.body.prixNuit) }
          : {}),
        ...(req.body.description !== undefined
          ? { description: String(req.body.description) }
          : {}),
        ...(req.body.disponible !== undefined
          ? { disponible: Boolean(req.body.disponible) }
          : {}),
      },
    });

    return res.json(chambre);
  },
);

app.delete(
  "/chambres/:id",
  authentifier,
  exigeRole("hotelier"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    if (req.user.hotelId === null || req.user.hotelId === undefined) {
      return res
        .status(403)
        .json({ erreur: "Aucun hôtel associé à ce compte" });
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

// 8. Administration
app.get("/admin/secret", authentifier, exigeRole("admin"), (req, res) => {
  res.json({ message: "Accès administrateur autorisé" });
});

export { app, prisma };
