import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ statut: "ok" });
});

export default router;
