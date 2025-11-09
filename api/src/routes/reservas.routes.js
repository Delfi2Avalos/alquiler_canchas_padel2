import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { crearReserva, disponibilidad, cambiarEstado } from "../controllers/reservas.controller.js";

const r = Router();

// GET /reservas/disponibilidad?canchaId=&fecha=YYYY-MM-DD   (pública)
r.get("/disponibilidad", disponibilidad);

// POST /reservas/   (JUGADOR o ADMIN crean)
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearReserva);

// PATCH /reservas/:id/estado   (solo ADMIN)
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstado);

export default r;
