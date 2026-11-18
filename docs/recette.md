# Recette client — Sprint 1

Les tests automatisés TA-001 à TA-010 se lancent depuis `api` avec `npm test`.
Ils utilisent MySQL, les routes Express et les données de démonstration. La base
doit être migrée et seedée. TA-005, TA-008, TA-009 et TA-010 créent des données
temporaires puis les suppriment pendant le test. Les autres tests ne modifient
pas les données, sauf certains cas complémentaires qui renvoient aux mêmes
valeurs déjà enregistrées. Le seed efface les données Finder de la base configurée : ne
le lancer que sur une base de test ou une base dont les données peuvent être
remplacées.

| ID     | Action                                                                                                 | Résultat attendu                                                                                                                               | Résultat obtenu le 2026-10-07                                                              | Exécutant |
| ------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------- |
| TA-001 | Ouvrir `GET /health`.                                                                                  | HTTP 200 et `{"statut":"ok"}`.                                                                                                                 | Réussi — HTTP 200 et statut `ok`.                                                          |
| TA-002 | Ouvrir `GET /hotels`.                                                                                  | HTTP 200 et une liste de 3 hôtels.                                                                                                             | Réussi — HTTP 200, 3 hôtels.                                                               |
| TA-003 | Ouvrir `GET /hotels/1`, puis `GET /hotels/999`.                                                        | La fiche répond 200 ; l'hôtel absent répond 404 avec une erreur JSON.                                                                          | Réussi — réponses 200 et 404 attendues.                                                    |
| TA-004 | Rechercher les chambres du `2026-10-10` au `2026-10-12`, puis du `2026-10-11` au `2026-10-13`.         | La chambre 4 est absente pendant le chevauchement avec la réservation confirmée (31 chambres), puis revient après la libération (32 chambres). | Réussi — 31 chambres sans l'id 4, puis 32 chambres avec l'id 4.                            |
| TA-005 | Créer un compte avec `POST /auth/register`.                                                            | HTTP 201 ; les informations publiques sont renvoyées sans mot de passe.                                                                        | Réussi — HTTP 201, compte temporaire nettoyé.                                              |
| TA-006 | Se connecter avec `POST /auth/login`, puis ouvrir `GET /me` avec le jeton.                             | HTTP 200 ; le jeton permet d'obtenir le profil du voyageur.                                                                                    | Réussi — connexion et profil HTTP 200.                                                     |
| TA-007 | Appeler `POST /reservations` avec le jeton d'un hôtelier.                                              | HTTP 403 : seul un voyageur peut créer une réservation.                                                                                        | Réussi — HTTP 403.                                                                         |
| TA-008 | Créer, modifier et supprimer une chambre avec un compte hôtelier.                                      | Les trois opérations réussissent.                                                                                                              | Réussi — création, modification et suppression HTTP 201/200 ; chambre temporaire nettoyée. |
| TA-009 | Créer une réservation, puis la chercher avec `GET /reservations/mine`.                                 | HTTP 201 ; la réservation appartient au voyageur et commence en `en_attente`.                                                                  | Réussi — réservation retrouvée, puis nettoyée.                                             |
| TA-010 | Un autre voyageur tente d'annuler la réservation ; l'hôtelier la confirme ; son propriétaire l'annule. | L'autre voyageur reçoit 403 ; confirmation et annulation par les rôles autorisés réussissent.                                                  | Réussi — 403 à l'autre voyageur, confirmation et annulation réussies.                      |

Les tests ont été exécutés avec `npm test` depuis `api` : **51 tests réussis,
0 échec**. TA-001 à TA-010 sont exécutés dans `api/tests/api.test.js`. Les autres
tests du fichier vérifient des cas complémentaires.

Pour rejouer les tests qui utilisent les données de démonstration, préparer
MySQL comme décrit dans [INSTALLATION.txt](../INSTALLATION.txt), puis exécuter
`npx prisma migrate deploy` et `npm run db:seed` depuis `api`. Le seed remplace
les données de la base Finder configurée : ne pas l'exécuter sur une base à
conserver.

## Recette frontend — réservations

La page « Mes réservations » est rafraîchie à l'ouverture, après une annulation
et toutes les cinq secondes tant qu'elle reste ouverte. Cette stratégie est
détaillée dans la [décision 0002](decisions/0002-raffraichissement-par-le-client.md).

| Action                                                                                                      | Résultat attendu                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Connecté comme voyageur, sélectionner une chambre, saisir des dates valides et réserver.                    | Un seul `POST /reservations` part ; le bouton est désactivé pendant l'envoi ; la réservation apparaît dans « Mes réservations ». |
| Envoyer une réservation refusée par l'API (par exemple des dates invalides).                                | Un message d'erreur apparaît ; le formulaire reste affiché et aucune réservation fantôme n'est ajoutée.                           |
| Annuler une réservation en attente ou confirmée.                                                            | Le `DELETE /reservations/:id` réussit ; la liste est relue ; le statut devient « Annulée » et le bouton disparaît.                 |
| Tenter d'annuler une réservation déjà refusée ou annulée, ou faire refuser la requête par l'API.             | Aucun bouton d'annulation n'est proposé pour ces statuts ; en cas d'erreur API, la ligne reste inchangée et l'erreur est affichée. |
| Laisser « Mes réservations » ouverte et modifier le statut depuis un compte hôtelier.                         | Le statut accepté/refusé apparaît au prochain rafraîchissement automatique, sans rechargement de la page.                          |
