# Recette client — Sprint 1

Les tests automatisés TA-001 à TA-010 se lancent depuis `api` avec `npm test`.
Ils utilisent MySQL, les véritables routes Express et les données de
démonstration. La base doit être migrée et seedée. Les tests ne créent, ne
modifient et ne suppriment aucune donnée. Le seed, lui, efface les données
Finder de la base configurée ; il faut donc le lancer seulement sur une base
de test dédiée ou une base dont les données peuvent être remplacées.

| ID | Action | Résultat attendu | Automatisé |
| --- | --- | --- | --- |
| TA-001 | Ouvrir `GET /health`. | HTTP 200 et `{"statut":"ok"}`. | Oui |
| TA-002 | Ouvrir `GET /hotels`. | HTTP 200 et une liste JSON d'hôtels. | Oui |
| TA-003 | Ouvrir `GET /hotels/1`, puis `GET /hotels/999`. | La fiche Amor répond 200 ; l'identifiant absent répond 404 avec une erreur JSON. | Oui |
| TA-004 | Créer un compte avec `POST /auth/register`. | HTTP 201 ; les données du compte sont renvoyées sans mot de passe. | Oui |
| TA-005 | Se connecter avec `POST /auth/login`. | HTTP 200 avec un JWT utilisable et les informations publiques du compte. | Oui |
| TA-006 | Appeler `GET /me` sans en-tête `Authorization`. | HTTP 401 avec une erreur JSON. | Oui |
| TA-007 | Appeler `POST /reservations` avec le jeton d'un hôtelier. | HTTP 403 : seul un voyageur peut réserver. | Oui |
| TA-008 | Créer, modifier puis supprimer avec `POST`, `PATCH` et `DELETE /chambres/:id`, en étant connecté comme hôtelier propriétaire. | Les trois opérations réussissent ; un hôtelier d'un autre hôtel reçoit 403. | Oui |
| TA-009 | Créer une réservation avec `POST /reservations`, puis la rechercher avec `GET /reservations/mine`. | HTTP 201 ; elle appartient au voyageur et commence au statut `en_attente`. Des dates inversées répondent 400. | Oui |
| TA-010 | Créer une réservation, tenter de l'annuler avec le jeton d'un autre voyageur, puis la confirmer et l'annuler avec les bons rôles. | L'autre voyageur reçoit 403 ; l'hôtelier confirme et le propriétaire annule sa propre réservation. | Oui |

Pour les essais manuels, utiliser les identifiants des comptes de démonstration
de `api/finder-data/comptes.json` pour les rôles voyageur et hôtelier. Pour
TA-004, choisir une adresse e-mail qui n'existe pas encore, puis réutiliser ce
compte pour TA-005. Pour TA-010, utiliser le jeton d'un second voyageur sur une
réservation créée par le premier.

Pour rejouer les tests manuels qui utilisent les données de démonstration,
préparer MySQL comme décrit dans [INSTALLATION.txt](../INSTALLATION.txt), puis
exécuter `npx prisma migrate deploy` et `npm run db:seed` depuis `api`.
Le seed remplace les données de la base Finder configurée : ne pas l'exécuter
sur une base à conserver.
