// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import express from "express";
const app = express();
app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true }));
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
