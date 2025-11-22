import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";

import {
  reporteReservasPorSucursal,
  reporteCanchasMasReservadas,
  reporteHorariosMasUsados,
  reporteHorariosVacios,
} from "../controllers/reportes.controller.js";

const r = Router();

r.get("/superadmin/reservas-por-sucursal", requireAuth(["SUPERADMIN"]), reporteReservasPorSucursal);

r.get("/admin/canchas-mas-reservadas", requireAuth(["ADMIN"]), reporteCanchasMasReservadas);

r.get("/admin/horarios-mas-usados", requireAuth(["ADMIN"]), reporteHorariosMasUsados);

r.get("/admin/horarios-vacios", requireAuth(["ADMIN"]), reporteHorariosVacios);

export default r;
