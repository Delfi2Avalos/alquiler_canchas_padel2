import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearPago,
  cambiarEstadoPago,
  listarPagosSucursal,   // ADMIN
  listarPagosGlobal      // SUPERADMIN
} from "../controllers/pagos.controller.js";

const r = Router();

/**
 * POST /pagos
 * Jugador o Admin pueden cargar el comprobante de pago
 */
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearPago);

/**
 * PATCH /pagos/:id/estado
 * Solo ADMIN puede cambiar el estado (PENDIENTE / VERIFICADO / RECHAZADO)
 */
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstadoPago);

/**
 * GET /pagos/sucursal
 * ADMIN ― ve solo pagos de SU sucursal
 */
r.get("/sucursal", requireAuth(["ADMIN"]), listarPagosSucursal);

/**
 * GET /pagos/admin
 * SUPERADMIN ― ve todos los pagos de todas las sucursales
 */
r.get("/admin", requireAuth(["SUPERADMIN"]), listarPagosGlobal);

export default r;
