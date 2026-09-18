# Architecture du projet Finder

## Vue d'ensemble

Finder est une API de réservation de chambres d'hôtel. Le projet est organisé autour d'un serveur Express et d'une base MySQL gérée avec Prisma.

```text
projet-finder/
├── api/
│   ├── src/server.js       # serveur Express et routes HTTP
│   ├── prisma/
│   │   ├── schema.prisma   # modèles de données
│   │   ├── migrations/     # évolution de la base
│   │   └── seed.js          # données initiales
│   ├── finder-data/         # fichiers de données du projet
│   ├── package.json         # scripts et dépendances
│   ├── package-lock.json
│   ├── .env.example         # modèle de configuration
│   └── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SPEC.md
│   └── rgpd/
├── front/                  # espace prévu pour le futur front
└── script/                 # scripts utilitaires
```

Les dossiers `node_modules/`, les caches Prisma, les fichiers `.env` locaux et les fichiers temporaires ne sont pas décrits ici : ils sont générés ou propres à chaque machine.

## API

Le serveur est défini dans `api/src/server.js`. Il utilise :

- Express pour les routes HTTP ;
- `dotenv` pour charger les variables d'environnement ;
- Prisma Client pour accéder à MySQL ;
- `bcrypt` pour les opérations liées aux mots de passe.

Le serveur se lance depuis le dossier `api` :

```powershell
cd api
npm run dev
```

## Routes principales

- `GET /health` : vérifie que l'API répond ;
- `GET /hotels` : liste les hôtels ;
- `GET /hotels/:id` : récupère un hôtel ;
- `GET /hotels/:id/chambres` : liste les chambres d'un hôtel ;
- `GET /chambres` : liste les chambres avec filtres possibles ;
- `GET /chambres/:id` : récupère une chambre.

Les filtres de `/chambres` peuvent porter sur l'hôtel, le prix maximal, la catégorie, la capacité et la disponibilité entre deux dates.

## Base de données

Le schéma Prisma se trouve dans `api/prisma/schema.prisma`. Les modèles principaux sont :

- `Hotels` ;
- `Chambres` ;
- `Comptes` ;
- `Reservations`.

La relation principale est la suivante : un hôtel possède plusieurs chambres, une chambre peut être liée à plusieurs réservations, et une réservation est associée à un compte.

La connexion est configurée avec `DATABASE_URL` dans `api/.env`. Ce fichier reste local et ne doit pas être publié.

## Scripts utiles

Depuis `api` :

```powershell
npm run dev       # démarre le serveur avec redémarrage automatique
npm start         # démarre le serveur
npm run check     # vérifie la syntaxe JavaScript
npm test          # lance les tests présents
npm run db:seed   # insère les données initiales
npx prisma validate
npx prisma migrate status
```

Les dépendances installées dans `api/node_modules/` sont générées avec `npm install` et ne font pas partie de l'architecture fonctionnelle du projet.
