import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearPago,
  cambiarEstadoPago,
  listarPagosSucursal, // ADMIN
  listarPagosGlobal,   // SUPERADMIN
} from "../controllers/pagos.controller.js";

const r = Router();

/**
 * POST /api/pagos
 * JUGADOR o ADMIN registran un pago
 */
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearPago);

/**
 * PATCH /api/pagos/:id/estado
 * Solo ADMIN puede cambiar el estado de un pago
 */
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstadoPago);

/**
 * GET /api/pagos/sucursal
 * ADMIN ― ve solo pagos de SU sucursal
 */
r.get("/sucursal", requireAuth(["ADMIN"]), listarPagosSucursal);

/**
 * GET /api/pagos/admin
 * SUPERADMIN ― ve todos los pagos
 */
r.get("/admin", requireAuth(["SUPERADMIN"]), listarPagosGlobal);

export default r;
