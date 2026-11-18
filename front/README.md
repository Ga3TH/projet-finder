# Frontend Finder

## Démarrage

Depuis la racine du dépôt :

```sh
cd front
npm install
npm run dev
```

Vite affiche l'adresse du serveur de développement : <http://localhost:5173>.

Le frontend est écrit en TypeScript (`src/`). L'API du Sprint 1 se démarre
séparément depuis `api/` et écoute par défaut sur <http://localhost:3000>. Son
adresse côté frontend est centralisée dans `src/config.ts`.

## Vérification

```sh
npm run typecheck
npm run lint
npm run build
```
