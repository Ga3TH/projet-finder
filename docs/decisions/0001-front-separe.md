# 0001 - Frontend séparé de l'API

Date : 2026-11-02  Statut : acceptée

## Contexte

Finder possède déjà une API Express dans `api/`. Le Sprint 2 ajoute une interface React ; garder son code et ses dépendances à part permet de faire évoluer l'interface sans mélanger les responsabilités du serveur.

## Décision

Le frontend React/Vite reste dans `front/`, séparé de l'API Express dans `api/`.
L'URL de l'API est centralisée dans `front/src/config.js`.

## Alternatives écartées

- Servir l'interface depuis Express : cela lie le démarrage et le déploiement du frontend à ceux de l'API.
- Placer les composants React dans `api/` : cela mélange l'interface, les routes et leurs dépendances.

## Conséquences

- Les deux applications se démarrent séparément : `npm run dev` depuis `front/` sert l'interface sur `http://localhost:5173`, et le serveur API reste sur `http://localhost:3000`.
- Les appels du navigateur vers l'API devront être autorisés par CORS ou passer par un proxy Vite.
- Les prochaines étapes peuvent développer les pages, les composants et les parcours de réservation dans le frontend sans déplacer l'API.
