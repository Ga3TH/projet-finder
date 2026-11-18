# 0002 - Rafraîchissement des réservations côté client

Date : 2026-11-18  Statut : acceptée

## Contexte

Un voyageur peut laisser « Mes réservations » ouvert pendant qu'un hôtelier
accepte ou refuse une demande. Un rechargement complet de la page affiche les
données à jour, mais interrompt le parcours et n'informe pas le voyageur tant
qu'il ne recharge pas lui-même.

## Décision

La page appelle `GET /reservations/mine` à son ouverture, après une action de
réservation ou d'annulation, puis toutes les cinq secondes tant qu'elle reste
affichée. Elle envoie le JWT dans `Authorization: Bearer …`. Les changements
réussis sont vérifiés par un nouvel appel à l'API ; après une annulation, le
statut renvoyé est aussi reflété immédiatement. Une erreur de mutation affiche
un message et ne change pas la réservation dans la liste.

## Alternatives écartées

- Recharger toute la page : cela interrompt la navigation et n'est pas
  nécessaire pour relire les données.
- Ne rafraîchir qu'à l'ouverture : un changement de statut fait par l'hôtelier
  ne serait pas visible tant que le voyageur ne revient pas sur la page.
- WebSocket ou événements envoyés par le serveur : cela ajoute une
  infrastructure persistante qui n'est pas justifiée pour ce projet.

## Conséquences

- Un changement fait par l'hôtelier apparaît au plus tard au prochain
  rafraîchissement, sans rechargement du document.
- Le rafraîchissement périodique ajoute un appel léger toutes les cinq secondes
  lorsque la page est ouverte ; les appels ne se chevauchent pas.
- Une annulation refusée conserve la ligne et son statut ; une annulation
  réussie affiche « Annulée » et retire le bouton d'annulation.
- Vérification manuelle : garder « Mes réservations » ouvert, modifier le
  statut de la réservation depuis un compte hôtelier, puis constater la mise à
  jour sans recharger la page. Vérifier également qu'une erreur d'API laisse la
  liste cohérente et affiche un message.
