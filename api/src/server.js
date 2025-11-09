import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import canchasRoutes from "./routes/canchas.routes.js";
import healthRoutes from "./routes/health.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import sucursalesRoutes from "./routes/sucursales.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: ["http://localhost:5173"], credentials: true })); // <— opcional

app.get("/", (_req, res) => res.json({
  ok: true,
  service: "api-padel",
  routes: ["/health","/sucursales","/canchas","/reservas","/pagos","/auth"]
}));

app.use("/auth", authRoutes);
app.use("/canchas", canchasRoutes);
app.use("/health", healthRoutes);
app.use("/pagos", pagosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/sucursales", sucursalesRoutes);

app.get("/db-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.use((_req, res) => res.status(404).json({ ok: false, msg: "Ruta no encontrada" }));

app.use((err, _req, res, _next) => {
  const dev = process.env.NODE_ENV !== "production";
  res.status(500).json({ ok: false, msg: "Error interno", ...(dev ? { err: String(err) } : {}) });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  pool.query("SELECT 1").then(() => console.log("DB ✅ pool OK")).catch(e => console.error("DB ❌", e.message));
});

// Cierre prolijo
const shutdown = async (signal) => {
  console.log(`\nRecibido ${signal}. Cerrando servidor...`);
  server.close(async () => {
    try { await pool.end(); } catch {}
    process.exit(0);
  });
};
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
process.on("uncaughtException",  (e) => { console.error("uncaughtException:", e); process.exit(1); });
