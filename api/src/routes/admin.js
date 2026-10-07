import { Router } from "express";
import { authentifier, exigeRole } from "../middlewares.js";

const router = Router();

router.get("/admin/secret", authentifier, exigeRole("admin"), (req, res) => {
  res.json({ message: "Accès administrateur autorisé" });
});

export default router;
