import { Router } from "express";
import {
  listarCanchasPorSucursalPublic,
  listarCanchasDeMiSucursal,
  crearCanchaEnMiSucursal,
  actualizarCanchaDeMiSucursal,
  eliminarCanchaDeMiSucursal,
} from "../controllers/canchas.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

/**
 * RUTA PÚBLICA
 * GET /api/canchas/sucursal/:sedeId
 * - Jugadores / público general pueden ver las canchas de una sucursal
 */
r.get("/sucursal/:sedeId", listarCanchasPorSucursalPublic);

/**
 * RUTAS SOLO ADMIN (por sucursal)
 * Base: /api/canchas
 *
 * - El ADMIN SOLO maneja canchas de su sucursal (req.user.sucursal)
 */

// GET /api/canchas/mi  -> lista canchas de la sucursal del admin
r.get("/mi", requireAuth(["ADMIN"]), listarCanchasDeMiSucursal);

// POST /api/canchas/   -> crear cancha en su sucursal
r.post("/", requireAuth(["ADMIN"]), crearCanchaEnMiSucursal);

// PUT /api/canchas/:id -> actualizar cancha de su sucursal
r.put("/:id", requireAuth(["ADMIN"]), actualizarCanchaDeMiSucursal);

// DELETE /api/canchas/:id -> eliminar cancha de su sucursal
r.delete("/:id", requireAuth(["ADMIN"]), eliminarCanchaDeMiSucursal);

export default r;
