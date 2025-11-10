import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearPago,
  cambiarEstadoPago,
  listarPagos, // opcional si querés listar pagos desde el panel admin
} from "../controllers/pagos.controller.js";

const r = Router();

/**
 * POST /pagos
 * Jugador o Admin pueden cargar el comprobante de pago (por seña o total)
 */
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearPago);

/**
 * PATCH /pagos/:id/estado
 * Solo ADMIN puede cambiar el estado (PENDIENTE / VERIFICADO / RECHAZADO)
 */
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstadoPago);

/**
 * GET /pagos (opcional)
 * Solo ADMIN — permite ver todos los pagos registrados
 */
// r.get("/", requireAuth(["ADMIN"]), listarPagos);

export default r;
