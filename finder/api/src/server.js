import "dotenv/config";
import express from "express";
import { readFileSync } from "node:fs";
import path from "node:path";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware pour lire le JSON
app.use(express.json());

// Chargement des données des chambres
const chambres = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "..", "finder-data", "chambres.json"),
    "utf8",
  ),
);

// Chargement des données des hotels
const hotels = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "..", "finder-data", "hotels.json"),
    "utf8",
  ),
);

//Routes Hôtels et Chambres
app.get("/hotels", (req, res) => {
  res.json(hotels);
});
/*app.get("/chambres", (req, res) => {
  res.json(chambres);
});*/

// Route pour récupérer un hôtel spécifique par son ID
app.get("/hotels/:id", (req, res) => {
  const id = Number(req.params.id);
  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({ erreur: "Hôtel introuvable" });
  }

  res.json(hotel);
});

// Route pour récupérer une chambre spécifique par son ID
app.get("/chambres/:id", (req, res) => {
  const id = Number(req.params.id);
  const chambre = chambres.find((c) => c.id === id);

  if (!chambre) {
    return res.status(404).json({ erreur: "Chambre introuvable" });
  }

  res.json(chambre);
});

//route filtrer suivant le prix
app.get("/chambres", (req, res) => {
  const { prix_max } = req.query;
  if (isNaN(Number(prix_max))) {
    return res
      .status(400)
      .json({ erreur: "Le prix maximum doit être un nombre" });
  }
  res.json(
    prix_max
      ? chambres.filter((c) => c.prix_nuit <= Number(prix_max))
      : chambres,
  );
});

// Démarrage du serveur (toujours à la toute fin)
app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
