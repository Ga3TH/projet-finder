// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import express from "express";
app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true }));
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));

//hotels et chambres

import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import express from "express";
const livres = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "..", "biblio-data", "livres.json"),
    "utf8",
  ),
);

const app = express();
app.use(express.json());

app.get("/hotels", (req, res) => res.json({ ok: true }));
app.get("/chambres", (req, res) => res.json(chambres));

app.get("/chambres/:id", (req, res) => {
  const id = Number(req.params.id);
  const livre = livres.find((l) => l.id === id);
  if (!livre) return res.status(404).json({ erreur: "Livre introuvable" });
  res.json(livre);
});
