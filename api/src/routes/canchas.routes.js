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


//RUTA QUE NECESITA EL FRONTEND: GET /api/sucursales/:id_sucursal/canchas
r.get("/por-sucursal/:id_sucursal", (req, res) => {
  req.params.sedeId = req.params.id_sucursal;  
  listarCanchasPorSucursalPublic(req, res);
});


//RUTA ORIGINAL: GET /api/canchas/sucursal/:sedeId
   
r.get("/sucursal/:sedeId", listarCanchasPorSucursalPublic);


//RUTAS SOLO ADMIN
// GET /api/canchas/mi
r.get("/mi", requireAuth(["ADMIN"]), listarCanchasDeMiSucursal);

// POST /api/canchas/
r.post("/", requireAuth(["ADMIN"]), crearCanchaEnMiSucursal);

// PUT /api/canchas/:id
r.put("/:id", requireAuth(["ADMIN"]), actualizarCanchaDeMiSucursal);

// DELETE /api/canchas/:id
r.delete("/:id", requireAuth(["ADMIN"]), eliminarCanchaDeMiSucursal);

export default r;
