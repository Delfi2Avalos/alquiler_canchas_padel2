import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";

// Routers
import authRoutes from "./routes/auth.routes.js";
import canchasRoutes from "./routes/canchas.routes.js";
import healthRoutes from "./routes/health.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import sucursalesRoutes from "./routes/sucursales.routes.js";

dotenv.config();
const app = express();

// Middlewares globales
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

// Rutas principales
app.use("/auth", authRoutes);
app.use("/canchas", canchasRoutes);
app.use("/health", healthRoutes);
app.use("/pagos", pagosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/sucursales", sucursalesRoutes);

// Prueba rápida de conexión
app.get("/db-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ ok: false, msg: "Ruta no encontrada" });
});

// Error handler global
app.use((err, _req, res, _next) => {
  const dev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    ok: false,
    msg: "Error interno",
    ...(dev ? { err: String(err) } : {}),
  });
});

// Servidor y cierre prolijo
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\nCerrando servidor...");
  server.close(async () => {
    try {
      await pool.end();
    } catch {}
    process.exit(0);
  });
});
