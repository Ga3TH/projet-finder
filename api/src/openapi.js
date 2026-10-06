/**
 * @openapi
 * components:
 *   schemas:
 *     Erreur:
 *       type: object
 *       required: [erreur]
 *       properties:
 *         erreur:
 *           type: string
 *           example: Corps invalide
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               chemin:
 *                 type: string
 *               message:
 *                 type: string
 *     Hotel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nom:
 *           type: string
 *         etoiles:
 *           type: integer
 *         adresse:
 *           type: string
 *         codePostal:
 *           type: string
 *         ville:
 *           type: string
 *         telephone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         gerant:
 *           type: string
 *         description:
 *           type: string
 *     Chambre:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         hotelId:
 *           type: integer
 *         numero:
 *           type: integer
 *         categorie:
 *           type: string
 *         capacite:
 *           type: integer
 *         prixNuit:
 *           type: integer
 *         description:
 *           type: string
 *         disponible:
 *           type: boolean
 *     ComptePublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [voyageur, hotelier, admin]
 *     Profil:
 *       allOf:
 *         - $ref: '#/components/schemas/ComptePublic'
 *         - type: object
 *           properties:
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 *             telephone:
 *               type: string
 *               nullable: true
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         chambreId:
 *           type: integer
 *         compteId:
 *           type: integer
 *         dateDebut:
 *           type: string
 *           format: date-time
 *         dateFin:
 *           type: string
 *           format: date-time
 *         statut:
 *           type: string
 *           enum: [en_attente, confirmee, refusee, annulee]
 *     Inscription:
 *       type: object
 *       additionalProperties: false
 *       required: [email, motDePasse]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         motDePasse:
 *           type: string
 *           minLength: 6
 *         nom:
 *           type: string
 *           minLength: 1
 *         prenom:
 *           type: string
 *           minLength: 1
 *         role:
 *           type: string
 *           enum: [voyageur, hotelier, admin]
 *           default: voyageur
 *         hotelId:
 *           type: integer
 *           minimum: 1
 *         telephone:
 *           type: string
 *     Connexion:
 *       type: object
 *       additionalProperties: false
 *       required: [email, motDePasse]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         motDePasse:
 *           type: string
 *           minLength: 6
 *     ChambreCreation:
 *       type: object
 *       additionalProperties: false
 *       required: [hotelId, numero, categorie, capacite, prixNuit]
 *       properties:
 *         hotelId:
 *           type: integer
 *           minimum: 1
 *         numero:
 *           type: integer
 *           minimum: 1
 *         categorie:
 *           type: string
 *           minLength: 1
 *         capacite:
 *           type: integer
 *           minimum: 1
 *         prixNuit:
 *           type: integer
 *           minimum: 0
 *         description:
 *           type: string
 *         disponible:
 *           type: boolean
 *       example:
 *         hotelId: 1
 *         numero: 301
 *         categorie: double
 *         capacite: 2
 *         prixNuit: 99
 *         description: Lit double, vue sur le port.
 *         disponible: true
 *     ChambreModification:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         hotelId:
 *           type: integer
 *           minimum: 1
 *         numero:
 *           type: integer
 *           minimum: 1
 *         categorie:
 *           type: string
 *           minLength: 1
 *         capacite:
 *           type: integer
 *           minimum: 1
 *         prixNuit:
 *           type: integer
 *           minimum: 0
 *         description:
 *           type: string
 *         disponible:
 *           type: boolean
 *       example:
 *         prixNuit: 109
 *         disponible: true
 *     ReservationCreation:
 *       type: object
 *       additionalProperties: false
 *       required: [chambreId, dateDebut, dateFin]
 *       properties:
 *         chambreId:
 *           type: integer
 *           minimum: 1
 *         dateDebut:
 *           type: string
 *           format: date
 *         dateFin:
 *           type: string
 *           format: date
 *       example:
 *         chambreId: 4
 *         dateDebut: '2027-06-10'
 *         dateFin: '2027-06-12'
 *     ReservationModification:
 *       type: object
 *       additionalProperties: false
 *       required: [statut]
 *       properties:
 *         statut:
 *           type: string
 *           enum: [en_attente, confirmee, refusee, annulee]
 *     ModificationProfilVoyageur:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         telephone:
 *           type: string
 *           minLength: 6
 *         nom:
 *           type: string
 *           minLength: 1
 *         prenom:
 *           type: string
 *           minLength: 1
 *     ReponseInscription:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Compte créé
 *         compte:
 *           $ref: '#/components/schemas/ComptePublic'
 *     ReponseConnexion:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT à coller dans le bouton Authorize de Swagger UI.
 *         compte:
 *           $ref: '#/components/schemas/ComptePublic'
 *   responses:
 *     Erreur400:
 *       description: Corps, paramètres ou dates invalides.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erreur'
 *     Erreur401:
 *       description: Jeton absent, invalide ou identifiants incorrects.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erreur'
 *     Erreur403:
 *       description: Rôle insuffisant ou ressource hors du périmètre autorisé.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erreur'
 *     Erreur404:
 *       description: Ressource introuvable.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erreur'
 *     Erreur409:
 *       description: Conflit avec l'état actuel de la ressource.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Erreur'
 *
 * /health:
 *   get:
 *     tags: [Système]
 *     summary: Vérifier que l'API répond
 *     operationId: verifierSante
 *     responses:
 *       '200':
 *         description: API disponible.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statut:
 *                   type: string
 *                   example: ok
 *
 * /hotels:
 *   get:
 *     tags: [Hôtels]
 *     summary: Lister les hôtels
 *     operationId: listerHotels
 *     responses:
 *       '200':
 *         description: Liste des hôtels.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *
 * /hotels/{id}:
 *   get:
 *     tags: [Hôtels]
 *     summary: Consulter la fiche d'un hôtel
 *     operationId: obtenirHotel
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de l'hôtel.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Fiche de l'hôtel.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *
 * /hotels/{id}/chambres:
 *   get:
 *     tags: [Hôtels, Chambres]
 *     summary: Lister les chambres d'un hôtel
 *     operationId: listerChambresHotel
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de l'hôtel.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Liste des chambres de l'hôtel.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chambre'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *
 * /chambres:
 *   get:
 *     tags: [Chambres]
 *     summary: Rechercher des chambres disponibles
 *     description: >-
 *       Tous les critères sont facultatifs. Le filtre de dates est appliqué
 *       lorsque date_debut et date_fin sont tous deux fournis. Le paramètre
 *       prix_max est le nom recommandé ; prixmax reste accepté pour compatibilité.
 *     operationId: rechercherChambres
 *     parameters:
 *       - name: hotel
 *         in: query
 *         required: false
 *         description: Identifiant numérique de l'hôtel ou partie de son nom.
 *         schema:
 *           type: string
 *         example: Amor
 *       - name: date_debut
 *         in: query
 *         required: false
 *         description: Date d'arrivée au format YYYY-MM-DD, à fournir avec date_fin.
 *         schema:
 *           type: string
 *           format: date
 *       - name: date_fin
 *         in: query
 *         required: false
 *         description: Date de départ au format YYYY-MM-DD, à fournir avec date_debut.
 *         schema:
 *           type: string
 *           format: date
 *       - name: capacite
 *         in: query
 *         required: false
 *         description: Capacité exacte de la chambre recherchée.
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: prix_max
 *         in: query
 *         required: false
 *         description: Prix maximal par nuit. L'ancien nom prixmax est également accepté.
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: categorie
 *         in: query
 *         required: false
 *         description: Catégorie de chambre (recherche partielle).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Chambres correspondant aux filtres, avec leur hôtel associé.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Chambre'
 *                   - type: object
 *                     properties:
 *                       hotel:
 *                         $ref: '#/components/schemas/Hotel'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *   post:
 *     tags: [Chambres]
 *     summary: Créer une chambre dans l'hôtel de l'hôtelier connecté
 *     operationId: creerChambre
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChambreCreation'
 *     responses:
 *       '201':
 *         description: Chambre créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chambre'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *
 * /chambres/{id}:
 *   get:
 *     tags: [Chambres]
 *     summary: Consulter une chambre
 *     operationId: obtenirChambre
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la chambre.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Fiche de la chambre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chambre'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *   patch:
 *     tags: [Chambres]
 *     summary: Modifier une chambre de l'hôtel de l'hôtelier connecté
 *     operationId: modifierChambre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la chambre.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChambreModification'
 *     responses:
 *       '200':
 *         description: Chambre modifiée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chambre'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *   delete:
 *     tags: [Chambres]
 *     summary: Supprimer une chambre de l'hôtel de l'hôtelier connecté
 *     description: Une chambre ayant des réservations ne peut pas être supprimée.
 *     operationId: supprimerChambre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la chambre.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Chambre supprimée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chambre'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *       '409':
 *         $ref: '#/components/responses/Erreur409'
 *
 * /auth/register:
 *   post:
 *     tags: [Authentification]
 *     summary: Créer un compte
 *     description: Le rôle est facultatif et vaut voyageur par défaut.
 *     operationId: inscrireCompte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inscription'
 *     responses:
 *       '201':
 *         description: Compte créé ; le mot de passe n'est pas renvoyé.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReponseInscription'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '409':
 *         description: Cette adresse e-mail est déjà utilisée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erreur'
 *
 * /auth/login:
 *   post:
 *     tags: [Authentification]
 *     summary: Se connecter et obtenir un JWT
 *     operationId: connecterCompte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Connexion'
 *     responses:
 *       '200':
 *         description: Connexion réussie ; le jeton est valable 24 heures.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReponseConnexion'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *
 * /me:
 *   get:
 *     tags: [Profil]
 *     summary: Consulter le compte connecté
 *     operationId: obtenirMonCompte
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profil du compte connecté.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profil'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *
 * /voyageurs/me:
 *   get:
 *     tags: [Voyageurs]
 *     summary: Consulter son profil voyageur
 *     operationId: obtenirProfilVoyageur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profil du voyageur connecté.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profil'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *   patch:
 *     tags: [Voyageurs]
 *     summary: Modifier son profil voyageur
 *     operationId: modifierProfilVoyageur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModificationProfilVoyageur'
 *     responses:
 *       '200':
 *         description: Profil mis à jour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profil'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *
 * /reservations/mine:
 *   get:
 *     tags: [Réservations]
 *     summary: Lister les réservations du voyageur connecté
 *     operationId: listerMesReservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Réservations du voyageur connecté.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *
 * /reservations/received:
 *   get:
 *     tags: [Réservations]
 *     summary: Lister les réservations reçues par l'hôtelier connecté
 *     operationId: listerReservationsRecues
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Réservations des chambres de l'hôtel de l'hôtelier.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *
 * /reservations:
 *   post:
 *     tags: [Réservations]
 *     summary: Réserver une chambre
 *     description: Le statut initial de la réservation est en_attente.
 *     operationId: creerReservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationCreation'
 *     responses:
 *       '201':
 *         description: Réservation créée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *
 * /reservations/{id}:
 *   patch:
 *     tags: [Réservations]
 *     summary: Accepter ou refuser une réservation de son hôtel
 *     operationId: modifierStatutReservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la réservation.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationModification'
 *     responses:
 *       '200':
 *         description: Statut de la réservation modifié.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *       '409':
 *         $ref: '#/components/responses/Erreur409'
 *   delete:
 *     tags: [Réservations]
 *     summary: Annuler sa réservation
 *     operationId: annulerReservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant numérique de la réservation.
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Réservation annulée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         $ref: '#/components/responses/Erreur400'
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 *       '404':
 *         $ref: '#/components/responses/Erreur404'
 *       '409':
 *         $ref: '#/components/responses/Erreur409'
 *
 * /admin/secret:
 *   get:
 *     tags: [Administration]
 *     summary: Vérifier l'accès administrateur
 *     operationId: verifierAccesAdministration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Accès administrateur autorisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Accès administrateur autorisé
 *       '401':
 *         $ref: '#/components/responses/Erreur401'
 *       '403':
 *         $ref: '#/components/responses/Erreur403'
 */
export {};
