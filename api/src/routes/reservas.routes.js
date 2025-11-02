import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { crearReserva, disponibilidad, cambiarEstado } from "../controllers/reservas.controller.js";

const r = Router();

r.get("/reservas/disponibilidad", disponibilidad);
r.post("/reservas", requireAuth(['JUGADOR','ADMIN']), crearReserva);
r.patch("/reservas/:id/estado", requireAuth(['ADMIN']), cambiarEstado);

export default r;
