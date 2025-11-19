import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  listarJugadores,
  actualizarJugador,
  desactivarJugador,
} from "../controllers/jugadores.controller.js";

const r = Router();

/**
 * GET /api/jugadores
 * Solo SUPERADMIN puede ver la lista completa
 */
r.get("/", requireAuth(["SUPERADMIN"]), listarJugadores);

/**
 * PUT /api/jugadores/:id
 * Actualizar datos de un jugador
 */
r.put("/:id", requireAuth(["SUPERADMIN"]), actualizarJugador);

/**
 * DELETE /api/jugadores/:id
 * Desactivar jugador (baja lógica)
 */
r.delete("/:id", requireAuth(["SUPERADMIN"]), desactivarJugador);

export default r;
