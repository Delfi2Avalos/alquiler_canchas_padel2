import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { misNotificaciones } from "../controllers/notificaciones.controller.js";

const r = Router();

// GET /api/notificaciones/mias
r.get(
  "/mias",
  requireAuth(["JUGADOR", "ADMIN", "SUPERADMIN"]),
  misNotificaciones
);


export default r;
