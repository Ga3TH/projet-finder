import { Router } from "express";

const router = Router();

/**
 * @openapi
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
 */
router.get("/health", (req, res) => {
  res.json({ statut: "ok" });
});

export default router;
