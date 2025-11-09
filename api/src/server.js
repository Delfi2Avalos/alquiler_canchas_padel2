import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

// --- RUTAS PÚBLICAS BÁSICAS ---
app.get("/", (_req, res) => {
  res.send("API Pádel OK — probá /health o /sucursales");
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "api-padel" }));

app.get("/db-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
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

// --- MANEJO DE 404 ---
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: "Ruta no encontrada" });
});

// --- MANEJO CENTRALIZADO DE ERRORES ---
app.use((err, _req, res, _next) => {
  const dev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    ok: false,
    msg: "Error interno",
    ...(dev ? { err: String(err) } : {})
  });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
  console.log(`API running at http://localhost:${PORT}`)
);

// Cierre prolijo
process.on("SIGINT", async () => {
  console.log("\nCerrando servidor...");
  server.close(async () => {
    try { await pool.end(); } catch {}
    process.exit(0);
  });
});
