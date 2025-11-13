import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearReserva,
  disponibilidad,
  cambiarEstado,
} from "../controllers/reservas.controller.js";

const r = Router();

// GET /api/reservas/disponibilidad?canchaId=1&fecha=YYYY-MM-DD
r.get("/disponibilidad", disponibilidad);

// POST /api/reservas
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearReserva);

// PATCH /api/reservas/:id/estado
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstado);

export default r;
