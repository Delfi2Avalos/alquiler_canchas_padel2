import { Router } from "express";
import { listarSucursales } from "../controllers/sucursales.controller.js";
const r = Router();

r.get("/sucursales", listarSucursales);

export default r;
