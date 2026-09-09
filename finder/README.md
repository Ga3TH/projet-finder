# finder/README.md

# Finder

Réservation de chambres d'hôtel pour le groupement Amor, Byzance, Caraïbes :
une API Express, bientôt un front React.

## Démarrer

cd api ; npm install
Copy-Item .env.example .env # puis remplir PORT et DATABASE_URL
npm run dev
curl.exe http://localhost:3000/health # attendu : {"ok":true}

## Structure

docs/ spec.md, la spec du sprint api/finder-data/ le kit,
jamais modifié
api/ l'API Express api/src/server.js le serveur et
ses routes

# api/.env.example (commité, valeurs vides)

PORT=
DATABASE_URL=
