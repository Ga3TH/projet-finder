import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const prisma = new PrismaClient();

app.use(express.json());

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
  const { hotel, prixmax, categorie, capacite, date_debut, date_fin } =
    req.query;

  const filtre = {};

  if (hotel) {
    if (!Number.isNaN(Number(hotel))) {
      filtre.hotelId = Number(hotel);
    } else {
      filtre.hotel = { nom: { contains: String(hotel) } };
    }
  }
  if (prixmax)
    filtre.prixNuit = {
      lte: Number(prixmax),
    };
  if (categorie)
    filtre.categorie = {
      contains: String(categorie),
    };
  if (capacite)
    filtre.capacite = {
      equals: Number(capacite),
    };

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
        statut: { equal: String("statut" ?? "confirmee") },
        dateDebut: { lt: fin },
        dateFin: { gt: debut },
      },
    };
  }

  const chambres = await prisma.chambres.findMany({
    where: filtre,
    include: {
      hotel: true,
    },
  });

  res.json(chambres);
});

app.post("/auth/register", async (req, res) => {
  const { email, motdepasse, motDePasse, nom, prenom, role, hotelId } =
    req.body;
  const motDePasseFinal = motDePasse ?? motdepasse;
  const emailFinal = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!emailFinal || !motDePasseFinal) {
    return res.status(400).json({ erreur: "Email et mot de passe requis" });
  }

  const compteExistant = await prisma.comptes.findUnique({
    where: { email: emailFinal },
  });

  if (compteExistant) {
    return res.status(409).json({ erreur: "Cet email est déjà utilisé" });
  }

  const compte = await prisma.comptes.create({
    data: {
      email: emailFinal,
      motDePasseClair: await bcrypt.hash(motDePasseFinal, 10),
      nom: nom ?? "",
      prenom: prenom ?? "",
      role: role ?? "voyageur",
      hotelId: hotelId ? Number(hotelId) : null,
      telephone: req.body.telephone ?? null,
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

app.post("/auth/login", async (req, res) => {
  const { email, motdepasse, motDePasse } = req.body;
  const motDePasseFinal = motDePasse ?? motdepasse;
  const emailFinal = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!emailFinal || !motDePasseFinal) {
    return res.status(400).json({ erreur: "Email et mot de passe requis" });
  }

  const compte = await prisma.comptes.findUnique({
    where: { email: emailFinal },
  });

  if (!compte) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  const motDePasseValide = await bcrypt.compare(
    motDePasseFinal,
    compte.motDePasseClair,
  );

  if (!motDePasseValide) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  const token = jwt.sign(
    {
      id: compte.id,
      email: compte.email,
      role: compte.role,
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

app.post("/chambres", authentifier, exigeRole("hotelier"), async (req, res) => {
  const {
    hotelId,
    numero,
    categorie,
    capacite,
    prixNuit,
    description,
    disponible,
  } = req.body;

  if (!hotelId || !numero || !categorie || !capacite || !prixNuit) {
    return res.status(400).json({ erreur: "Champs obligatoires manquants" });
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
});

app.patch(
  "/chambres/:id",
  authentifier,
  exigeRole("hotelier"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ erreur: "Identifiant invalide" });
    }

    const chambre = await prisma.chambres.findUnique({ where: { id } });

    if (!chambre) {
      return res.status(404).json({ erreur: "Chambre introuvable" });
    }

    const miseAJour = await prisma.chambres.update({
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

    return res.json(miseAJour);
  },
);

app.get("/admin/secret", authentifier, exigeRole("admin"), (req, res) => {
  res.json({ message: "Accès administrateur autorisé" });
});

export { app };

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
}
