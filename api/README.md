# Finder API

API Express du projet Finder. Les routes publiques utilisent les fichiers JSON de `finder-data/`.

## Installation

Depuis la racine du dépôt :

```powershell
npm install
npm --prefix finder/api install
```

Créer `finder/api/.env` à partir de `.env.example` si une base MySQL est utilisée.

## Commandes

Depuis la racine :

```powershell
npm run start
npm run dev
npm test
npm run check
```

Depuis `finder/api` :

```powershell
npm run db:seed
```

Le seed nécessite une base MySQL accessible avec `DATABASE_URL` et remplace les données existantes des tables Finder.

## Routes disponibles

- `GET /health` : vérifie que l'API répond.
- `GET /hotels` : liste les hôtels.
- `GET /hotels/:id` : retourne un hôtel.
- `GET /chambres` : liste les chambres.
- `GET /chambres/:id` : retourne une chambre.
- `GET /chambres?prix_max=100` : filtre les chambres par prix maximum à la nuit.

Les erreurs sont retournées au format JSON avec une propriété `erreur`.
