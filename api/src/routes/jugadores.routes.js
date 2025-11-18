import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  listarJugadores,
  actualizarJugador,
  eliminarJugador,
} from "../controllers/jugadores.controller.js";

const r = Router();

// Todas requieren SUPERADMIN
r.get("/", requireAuth(["SUPERADMIN"]), listarJugadores);
r.put("/:id", requireAuth(["SUPERADMIN"]), actualizarJugador);
r.delete("/:id", requireAuth(["SUPERADMIN"]), eliminarJugador);

export default r;
