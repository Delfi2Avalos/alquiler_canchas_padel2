import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearReserva,
  disponibilidad,
  cambiarEstado,
} from "../controllers/reservas.controller.js";

const r = Router();

/**
 * GET /reservas/disponibilidad?canchaId=1&fecha=YYYY-MM-DD
 * Pública — permite ver horarios ocupados/libres
 */
r.get("/disponibilidad", disponibilidad);

/**
 * POST /reservas
 * Requiere estar logueado — Jugador o Admin crean una reserva
 */
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearReserva);

/**
 * PATCH /reservas/:id/estado
 * Solo ADMIN puede cambiar el estado de una reserva
 */
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstado);

export default r;
