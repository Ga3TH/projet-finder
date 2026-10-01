# Finder API

API Express avec persistance MySQL via Prisma. Toutes les commandes
s'exécutent depuis le dossier `api`.

## Installation

```powershell
npm install
Copy-Item .env.example .env
```

Renseigner `PORT` et `DATABASE_URL` dans `.env`, puis préparer la base :

```powershell
npx prisma generate
npx prisma migrate deploy
```

Pour charger les données de démonstration, lancer `npm run db:seed`. Attention :
le seed remplace les données existantes des tables Finder.

## Commandes

- `npm run dev` : démarrer en mode développement.
- `npm start` : démarrer le serveur.
- `npm run check` : vérifier la syntaxe JavaScript.
- `npm test` : lancer les tests d'intégration.

Les tests nécessitent une base MySQL migrée et chargée avec le seed. Le serveur
répond à `GET /health` avec `{"statut":"ok"}`. Les erreurs API sont renvoyées
en JSON avec une propriété `erreur`.

## Routes principales

- `GET /hotels`, `GET /hotels/:id`
- `GET /chambres`, `GET /chambres/:id`, `GET /hotels/:id/chambres`
- `POST /auth/register`, `POST /auth/login`, `GET /me`
- `POST /reservations`, `GET /reservations/mine`, `GET /reservations/received`
- `PATCH /reservations/:id`, `DELETE /reservations/:id`
