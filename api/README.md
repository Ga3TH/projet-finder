# Finder API

API Express avec persistance MySQL via Prisma. Toutes les commandes
s'exécutent depuis le dossier `api`.

## Installation

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Renseigner `PORT` et `DATABASE_URL` dans `.env`, puis préparer la base :

```powershell
npx prisma generate
npx prisma migrate deploy
```

Pour charger les données de démonstration, lancer la commande ci-dessous. Attention :
le seed remplace les données existantes des tables Finder :

```powershell
npm run db:seed
```

## Commandes

- `npm run dev` : démarrer en mode développement.
- `npm start` : démarrer le serveur.
- `npm run check` : vérifier la syntaxe JavaScript.
- `npm test` : lancer les 10 tests d'intégration Vitest/Supertest.
- `npm run test:coverage` : afficher la couverture V8 des routes Express.

Les tests appellent les vraies routes Express et vérifient les erreurs HTTP
avec les données seedées. Ils lisent la base MySQL configurée par
`DATABASE_URL`, mais ne créent, ne modifient et ne suppriment aucune donnée.
La recette client est décrite dans `docs/recette.md`. Le serveur répond à
`GET /health` avec `{"statut":"ok"}`.

Pour préparer une base de test isolée, crée `finder_test` dans MySQL, configure
`DATABASE_URL` dans `.env` pour pointer vers cette base, puis exécute :

```powershell
npx prisma migrate deploy
npm run db:seed
npm test
npm run test:coverage
```

Le seed remplace les données Finder de cette base ; garde donc une base de test
dédiée. `npm test` doit afficher 10 tests d'API réussis (plus le test-exemple
Vitest). Le rapport de couverture concerne `src/app.js`.

## Ouvrir Swagger

Dans PowerShell, place-toi dans `api`, installe les dépendances si nécessaire,
puis démarre le serveur :

```powershell
Set-Location "C:\.fichier G\projetSIO2\projet-finder\api"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm run dev
```

Ouvre ensuite [http://localhost:3000/docs](http://localhost:3000/docs). La
spécification OpenAPI en JSON est disponible sur
[http://localhost:3000/docs/openapi.json](http://localhost:3000/docs/openapi.json).
Pour essayer les routes qui lisent ou modifient des données, configure MySQL,
applique les migrations et charge le seed. Dans Swagger UI, utilise **Authorize**
et colle le JWT obtenu avec `POST /auth/login` (sans ajouter `Bearer`).

Si la stratégie PowerShell bloque `npm.ps1`, `Set-ExecutionPolicy` ci-dessus ne
l'autorise que pour le terminal courant ; ferme ce terminal pour revenir au
réglage précédent.

## Routes principales

- `GET /hotels`, `GET /hotels/:id`
- `GET /chambres`, `GET /chambres/:id`, `GET /hotels/:id/chambres`
- `POST /chambres`, `PATCH /chambres/:id`, `DELETE /chambres/:id`
- `POST /auth/register`, `POST /auth/login`, `GET /me`
- `POST /reservations`, `GET /reservations/mine`, `GET /reservations/received`
- `PATCH /reservations/:id`, `DELETE /reservations/:id`
