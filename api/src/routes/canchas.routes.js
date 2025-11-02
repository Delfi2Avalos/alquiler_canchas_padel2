import { Router } from "express";
import { listarCanchasPorSucursal } from "../controllers/canchas.controller.js";
const r = Router();

r.get("/canchas/sucursal/:sedeId", listarCanchasPorSucursal);

export default r;
