import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// CORS básico para Vite/localhost
app.use(cors({ origin: true, credentials: true }));

// Ruta de prueba
app.get("/health", (_req, res) => res.json({ ok: true, service: "api-padel" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
