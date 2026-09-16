// prisma/seed.js
import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_DIR = path.join(import.meta.dirname, "..", "finder-data");

const lire = (fichier) =>
  JSON.parse(readFileSync(path.join(DATA_DIR, fichier), "utf8"));

async function main() {
  const hotels = lire("hotels.json");
  const chambres = lire("chambres.json");
  const comptes = lire("comptes.json");
  const reservations = lire("reservations.json");

  // vidage dans l'ordre INVERSE des dépendances
  await prisma.reservations.deleteMany();
  await prisma.chambres.deleteMany();
  await prisma.comptes.deleteMany();
  await prisma.hotels.deleteMany();

  // hôtels d'abord : rien ne les référence
  await prisma.hotels.createMany({
    data: hotels.map((h) => ({
      id: h.id,
      nom: h.nom,
      etoiles: h.etoiles,
      adresse: h.adresse,
      codePostal: h.code_postal,
      ville: h.ville,
      telephone: h.telephone,
      email: h.email,
      gerant: h.gerant,
      description: h.description,
    })),
  });

  // chambres ensuite : dépendent de hotelId
  await prisma.chambres.createMany({
    data: chambres.map((c) => ({
      id: c.id,
      hotelId: c.hotel_id,
      numero: Number(c.numero),
      categorie: c.categorie,
      capacite: c.capacite,
      prixNuit: c.prix_nuit,
      description: c.description,
      disponible: c.disponible,
    })),
  });

  // comptes : mot de passe haché avant insertion
  const comptesHaches = await Promise.all(
    comptes.map(async (c) => ({
      id: c.id,
      role: c.role,
      email: c.email,
      motDePasseClair: await bcrypt.hash(c.mot_de_passe_clair, 10),
      nom: c.nom,
      prenom: c.prenom,
      hotelId: c.hotel_id ?? null,
      telephone: c.telephone ?? null,
    })),
  );
  await prisma.comptes.createMany({ data: comptesHaches });

  // réservations en dernier : dépendent de chambreId et compteId
  await prisma.reservations.createMany({
    data: reservations.map((r) => ({
      id: r.id,
      chambreId: r.chambre_id,
      compteId: r.voyageur_id,
      dateDebut: new Date(r.date_arrivee),
      dateFin: new Date(r.date_depart),
      statut: r.statut,
    })),
  });

  console.log(
    `${hotels.length} hôtels, ${chambres.length} chambres, ${comptes.length} comptes, ${reservations.length} réservations`,
  );
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
