import { Router } from "express";
import { authentifier, exigeRole } from "../middlewares.js";

const router = Router();

/**
 * @openapi
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
router.get("/admin/secret", authentifier, exigeRole("admin"), (req, res) => {
  res.json({ message: "Accès administrateur autorisé" });
});

export default router;
