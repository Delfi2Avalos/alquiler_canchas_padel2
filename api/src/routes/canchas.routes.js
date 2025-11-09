import { Router } from "express";
import { listarCanchasPorSucursal } from "../controllers/canchas.controller.js";

const r = Router();

// GET /canchas/sucursal/:sedeId
r.get("/sucursal/:sedeId", listarCanchasPorSucursal);

export default r;
