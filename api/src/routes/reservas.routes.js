import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { pool } from "../config/db.js";

import {
  disponibilidad,
  horariosDisponibles,
  crearReserva,
  cambiarEstado,
  listarMisReservas,
  listarReservasDeMiSucursal,
  listarReservasGlobal,
} from "../controllers/reserva.controller.js";

const r = Router();

// JUGADOR o ADMIN → ver disponibilidad del día
r.get("/disponibilidad", requireAuth(["JUGADOR", "ADMIN"]), disponibilidad);

// Horarios verdes/libres u ocupados (modo “cuadriculado”)
r.get("/horarios", requireAuth(["JUGADOR", "ADMIN"]), horariosDisponibles);

// Crear reserva (estado PENDIENTE)
r.post("/", requireAuth(["JUGADOR", "ADMIN"]), crearReserva);

// Cambiar estado (CONFIRMADA / RECHAZADA) → solo ADMIN
r.patch("/:id/estado", requireAuth(["ADMIN"]), cambiarEstado);

// Reservas del usuario logueado
r.get("/mias", requireAuth(["JUGADOR", "ADMIN"]), listarMisReservas);

// Reservas de la sucursal del ADMIN
r.get("/sucursal", requireAuth(["ADMIN"]), listarReservasDeMiSucursal);

// SUPERADMIN ve todas las reservas globales
r.get("/admin", requireAuth(["SUPERADMIN"]), listarReservasGlobal);

// Horarios ocupados de una cancha en una fecha (para ElegirHorario)
r.get(
  "/ocupados/:canchaId/:fecha",
  requireAuth(["JUGADOR", "ADMIN"]),
  async (req, res) => {
    const { canchaId, fecha } = req.params;

    try {
      const [rows] = await pool.query(
        `SELECT inicio, fin
         FROM reserva
         WHERE id_cancha = ?
           AND DATE(inicio) = DATE(?)
           AND estado IN ('PENDIENTE','CONFIRMADA')
         ORDER BY inicio`,
        [canchaId, fecha]
      );

      return res.json({ ok: true, data: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        ok: false,
        message: "Error consultando horarios ocupados",
      });
    }
  }
);

export default r;
