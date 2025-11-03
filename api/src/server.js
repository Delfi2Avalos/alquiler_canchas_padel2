import { pool } from "./config/db.js";
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

app.get("/", (_req, res) => {
  res.send('API Pádel OK — probá /health o /sucursales');
});

app.get("/db-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/sucursales", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_sucursal, nombre, ciudad, provincia, hora_apertura, hora_cierre FROM sucursal ORDER BY nombre"
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
