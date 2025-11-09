import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { crearPago, cambiarEstadoPago } from "../controllers/pagos.controller.js";

const r = Router();

// POST /pagos/        (JUGADOR o ADMIN pueden cargar pago)
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearPago);

// PATCH /pagos/:id/estado   (solo ADMIN cambia estado de pago)
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstadoPago);

export default r;
