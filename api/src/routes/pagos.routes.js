import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { crearPago, cambiarEstadoPago } from "../controllers/pagos.controller.js";

const r = Router();

r.post("/pagos", requireAuth(['JUGADOR','ADMIN']), crearPago);
r.patch("/pagos/:id/estado", requireAuth(['ADMIN']), cambiarEstadoPago);

export default r;
