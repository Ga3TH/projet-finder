# finder/README.md
# Finder

API de réservation de chambres d'hôtel pour le groupement Amor, Byzance et
Caraïbes. Le serveur Express et son client Prisma se trouvent dans `api`.

## Démarrer

Depuis la racine du dépôt, installer l'API et créer sa configuration locale :

```powershell
cd api
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Renseigner `PORT` et `DATABASE_URL` dans `api/.env`, puis préparer MySQL et
démarrer le serveur (les commandes `npm` ci-dessous s'exécutent dans PowerShell) :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Vérifier avec `curl.exe http://localhost:3000/health`. La réponse attendue est
`{"statut":"ok"}`.

L'interface interactive de l'API est sur
[http://localhost:3000/docs](http://localhost:3000/docs). Pour l'authentification,
connecte-toi avec `POST /auth/login`, puis colle le JWT reçu dans **Authorize**.
Les essais qui utilisent les données nécessitent MySQL migré et seedé.

## Vérifications

Depuis `api`, lancer `npm run check` et `npm test`. Les dix tests Vitest/Supertest
utilisent la vraie base MySQL indiquée par `DATABASE_URL` et nécessitent une base
migrée et seedée. Pour protéger tes données, utilise une base de test dédiée :
le seed efface les données Finder de la base configurée. Les tests nettoient
uniquement les comptes, chambres et réservations qu'ils créent eux-mêmes. La
recette client est détaillée dans [docs/recette.md](docs/recette.md).

## Structure

- `api/src/app.js` : application Express et routes API.
- `api/src/server.js` : démarrage du serveur HTTP.
- `api/prisma/` : schéma, migrations et seed.
- `api/finder-data/` : données de démonstration.
- `docs/` : spécification et documentation du projet.
