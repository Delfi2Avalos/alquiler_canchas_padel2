import { Router } from "express";
import {
  listarSucursalesPublic,
  listarSucursalesAdmin,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
  miSucursal,
} from "../controllers/sucursales.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

/**
 * RUTA PÚBLICA
 * GET /api/sucursales/
 * - Jugadores / cualquiera puede ver las sucursales (para elegir dónde reservar)
 */
r.get("/", listarSucursalesPublic);

/**
 * RUTAS SOLO SUPERADMIN
 * Base: /api/sucursales
 */

// GET /api/sucursales/admin  -> lista todas con más datos
r.get("/admin", requireAuth(["SUPERADMIN"]), listarSucursalesAdmin);

// POST /api/sucursales/ -> crear sucursal
r.post("/", requireAuth(["SUPERADMIN"]), crearSucursal);

// PUT /api/sucursales/:id -> actualizar sucursal
r.put("/:id", requireAuth(["SUPERADMIN"]), actualizarSucursal);

// DELETE /api/sucursales/:id -> eliminar sucursal
r.delete("/:id", requireAuth(["SUPERADMIN"]), eliminarSucursal);

/**
 * RUTA SOLO ADMIN
 * GET /api/sucursales/mi
 * - El admin ve SOLO la sucursal a la que pertenece
 */
r.get("/mi", requireAuth(["ADMIN"]), miSucursal);

export default r;
