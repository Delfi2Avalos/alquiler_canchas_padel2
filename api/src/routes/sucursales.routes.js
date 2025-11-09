import { Router } from "express";
import { listarSucursales } from "../controllers/sucursales.controller.js";

const r = Router();

// GET /sucursales/
r.get("/", listarSucursales);

export default r;
