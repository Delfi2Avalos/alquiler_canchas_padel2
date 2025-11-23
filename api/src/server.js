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
import superAdminRoutes from "./routes/superadmin.routes.js";
import adminsRoutes from "./routes/admins.routes.js";
import jugadoresRoutes from "./routes/jugadores.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";  
import notificacionesRoutes from "./routes/notificaciones.routes.js";

dotenv.config();
const app = express();

// Middleware global
app.use(express.json());
app.use(morgan("dev"));

//CORS configurable por .env
const rawOrigins = process.env.CORS_ORIGINS || "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS bloqueado para origen:", origin);
      return callback(new Error("Origen no permitido por CORS: " + origin));
    },
    credentials: true,
  })
);

// Rutas
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    service: "api-padel",
    routes: [
      "/api/health",
      "/api/sucursales",
      "/api/canchas",
      "/api/reservas",
      "/api/pagos",
      "/api/auth",
      "/api/reportes"
    ],
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/canchas", canchasRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/sucursales", sucursalesRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/jugadores", jugadoresRoutes);
app.use("/api/usuario", usuariosRoutes);
app.use("/api/reportes", reportesRoutes);  
app.use("/api/notificaciones", notificacionesRoutes); 

// Test DB
app.get("/api/db-check", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 404
app.use((_req, res) =>
  res.status(404).json({ ok: false, msg: "Ruta no encontrada" })
);

// Manejador global de errores
app.use((err, _req, res, _next) => {
  const dev = process.env.NODE_ENV !== "production";
  console.error("Error:", err);
  res.status(500).json({
    ok: false,
    msg: "Error interno",
    ...(dev ? { err: String(err) } : {}),
  });
});

// Inicio del servidor
const PORT = process.env.PORT || 3001;

// "0.0.0.0" permite accesos desde otras PCs por IP
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
  console.log("CORS_ORIGINS:", allowedOrigins);

  pool
    .query("SELECT 1")
    .then(() => console.log("DB ✅ pool OK"))
    .catch((e) => console.error("DB ❌", e.message));
});

// Cierre prolijo
const shutdown = async (signal) => {
  console.log(`\nRecibido ${signal}. Cerrando servidor...`);
  server.close(async () => {
    try {
      await pool.end();
    } catch {}
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (r) =>
  console.error("unhandledRejection:", r)
);
process.on("uncaughtException", (e) => {
  console.error("uncaughtException:", e);
  process.exit(1);
});
