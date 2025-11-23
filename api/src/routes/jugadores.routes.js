import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  listarJugadores,
  actualizarJugador,
  desactivarJugador,
} from "../controllers/jugadores.controller.js";

const r = Router();


//ruta: GET /api/jugadores
//Solo SUPERADMIN puede ver la lista completa
r.get("/", requireAuth(["SUPERADMIN"]), listarJugadores);

//ruta: PUT /api/jugadores/:id
//Actualizar datos de un jugador
r.put("/:id", requireAuth(["SUPERADMIN"]), actualizarJugador);


 //ruta: DELETE /api/jugadores/:id
 //Desactivar jugador
r.delete("/:id", requireAuth(["SUPERADMIN"]), desactivarJugador);

export default r;
