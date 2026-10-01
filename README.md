# finder/README.md
# Finder

API de réservation de chambres d'hôtel pour le groupement Amor, Byzance et
Caraïbes. Le serveur Express et son client Prisma se trouvent dans `api`.

## Démarrer

Depuis la racine du dépôt, installer l'API et créer sa configuration locale :

```powershell
cd api
npm install
Copy-Item .env.example .env
```

Renseigner `PORT` et `DATABASE_URL` dans `api/.env`, puis préparer MySQL et
démarrer le serveur :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Vérifier avec `curl.exe http://localhost:3000/health`. La réponse attendue est
`{"statut":"ok"}`.

## Vérifications

Depuis `api`, lancer `npm run check` et `npm test`. Les tests d'intégration
nécessitent une base MySQL migrée et chargée avec les données de démonstration.

## Structure

- `api/src/server.js` : routes Express.
- `api/prisma/` : schéma, migrations et seed.
- `api/finder-data/` : données de démonstration.
- `docs/` : spécification et documentation du projet.
