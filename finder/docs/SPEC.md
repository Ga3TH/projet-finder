# docs/spec.md -- gabarit de départ, à compléter au fil des étapes
# [ ] étape non franchie (normal en cours de route) [~] garde : ne doit
jamais être faux NON MESURABLE : on ne peut pas trancher, à compter à part
# Spec Finder - Sprint 1 [MINIMAL]
Équipe : ... Version : v1 du AAAA-MM-JJ (étape 1)
Règle : relue au début de chaque séance ; chaque amendement est daté dans le
journal.
## Étape 1 - en mémoire
[ ] npm run dev démarre sans erreur -> le terminal affiche
l'adresse du serveur
[ ] GET /health -> 200, {"ok":true}
[ ] Kit chargé une seule fois au démarrage -> readFileSync hors des
routes
[ ] GET /hotels -> 200, tableau de 3 hôtels
[ ] GET /hotels/:id -> 200 la fiche, ou 404 avec
corps JSON
[ ] GET /chambres -> 200, tableau de 32
chambres
[ ] GET /chambres/:id -> 200 la fiche, ou 404 avec
corps JSON
[ ] req.params.id converti avec Number() -> /hotels/1 répond 200,
/hotels/abc répond 404
[ ] .env avec PORT et DATABASE_URL -> le fichier existe, il
n'est pas commité
[ ] README.md et api/.env.example -> un camarade démarre sans
poser de question
[ ] GET /chambres?prix_max=89 -> 200, 12 chambres ; sans
critère, 32
## Étapes 2 à 8 - déclarées, non franchies
[ ] E2 Base MySQL via Prisma : schéma, migration, seed du kit -> tables
visibles dans Adminer
[ ] E3 Recherche de chambres disponibles -> GET
/chambres?... filtre
[ ] E4 Inscription, connexion JWT 24 h, écritures protégées -> sans
jeton 401, mauvais rôle 403
[ ] E5 Validation Zod [ACCEPTABLE] -> corps
invalide 400, jamais 500
[ ] E6 Réservations et statuts ->
en_attente, confirmee, refusee, annulee
[ ] E7 Documentation Swagger de toutes les routes -> /docs
les affiche toutes
[ ] E8 Tests et recette -> npm test
passe, TA-001 à TA-010
## Gardes
[~] Aucun secret dans le dépôt : .env est dans .gitignore
[~] Aucune route ne répond 500 sur un id inconnu ou mal formé
[~] Toute erreur a un corps JSON de la même forme : { "erreur": "..." }
## Non mesurable
NON MESURABLE Temps de réponse de la recherche : pas de jeu de données
assez grand pour trancher
## Journal
AAAA-MM-JJ ... création v1, étape 1