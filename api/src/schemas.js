import { z } from "zod";

export const schemaRegister = z
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

export const schemaLogin = z
  .object({
    email: z.string().email(),
    motDePasse: z.string().min(6),
  })
  .strict();

export const schemaUpdateVoyageur = z
  .object({
    telephone: z.string().min(6).optional(),
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
  })
  .partial()
  .strict();

export const schemaChambre = z
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

export const schemaUpdateChambre = schemaChambre.partial().strict();

export const schemaReservation = z
  .object({
    chambreId: z.number().int().positive(),
    dateDebut: z.string().min(1),
    dateFin: z.string().min(1),
  })
  .strict();

export const schemaUpdateReservation = z
  .object({
    statut: z.enum(["en_attente", "confirmee", "refusee", "annulee"]),
  })
  .strict();
