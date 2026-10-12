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
 */
export {};
