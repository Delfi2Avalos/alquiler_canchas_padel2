import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearReserva,
  disponibilidad,
  cambiarEstado,
  listarMisReservas,
  listarReservasDeMiSucursal,
  listarReservasGlobal,
} from "../controllers/reservas.controller.js";

const r = Router();

/**
 * DISPONIBILIDAD
 * GET /api/reservas/disponibilidad?canchaId=1&fecha=YYYY-MM-DD
 * - Pública: cualquiera puede consultar
 */
r.get("/disponibilidad", disponibilidad);

/**
 * CREAR RESERVA
 * POST /api/reservas
 * body: { id_cancha, inicio, fin, precio_total }
 * - Requiere auth (JUGADOR o ADMIN)
 * - id_sucursal se infiere SIEMPRE desde la cancha
 */
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearReserva);

/**
 * CAMBIAR ESTADO DE RESERVA
 * PATCH /api/reservas/:id/estado
 * body: { estado }
 * - Solo ADMIN (y solo reservas de su sucursal)
 */
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstado);

/**
 * LISTAR MIS RESERVAS
 * GET /api/reservas/mias
 * - JUGADOR / ADMIN: ve solo sus propias reservas
 */
r.get("/mias", requireAuth(["JUGADOR", "ADMIN"]), listarMisReservas);

/**
 * LISTAR RESERVAS DE MI SUCURSAL (ADMIN)
 * GET /api/reservas/sucursal
 * - ADMIN: ve reservas de su sucursal (req.user.sucursal)
 */
r.get("/sucursal", requireAuth(["ADMIN"]), listarReservasDeMiSucursal);

/**
 * LISTADO GLOBAL DE RESERVAS (SUPERADMIN)
 * GET /api/reservas/admin
 * - SUPERADMIN: ve todas las reservas de todas las sucursales
 */
r.get("/admin", requireAuth(["SUPERADMIN"]), listarReservasGlobal);

export default r;
