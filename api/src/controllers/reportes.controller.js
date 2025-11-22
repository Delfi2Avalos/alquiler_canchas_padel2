import { pool } from "../config/db.js";

/**
 * ======================================================
 * SUPERADMIN → TOTAL DE RESERVAS POR SUCURSAL
 * ======================================================
 */
export async function reporteReservasPorSucursal(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.id_sucursal,
          s.nombre AS sucursal,
          COUNT(r.id_reserva) AS total_reservas
       FROM sucursal s
       LEFT JOIN reserva r ON r.id_sucursal = s.id_sucursal
       GROUP BY s.id_sucursal, s.nombre
       ORDER BY total_reservas DESC`
    );

    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error reporte superadmin:", err);
    return res.status(500).json({ ok: false, msg: "Error interno" });
  }
}

/**
 * ======================================================
 * ADMIN → CANCHAS MÁS RESERVADAS EN SU SUCURSAL
 * ======================================================
 */
export async function reporteCanchasMasReservadas(req, res) {
  try {
    const sucursalId = req.user?.sucursal;

    const [rows] = await pool.query(
  `SELECT 
      c.id_cancha,
      c.nombre AS cancha,
      s.nombre AS sucursal,
      COUNT(r.id_reserva) AS total_reservas
   FROM cancha c
   JOIN sucursal s ON s.id_sucursal = c.id_sucursal
   LEFT JOIN reserva r ON r.id_cancha = c.id_cancha
   WHERE c.id_sucursal = ?
   GROUP BY c.id_cancha, c.nombre, s.nombre
   ORDER BY total_reservas DESC`,
  [sucursalId]
);

    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error reporte admin A:", err);
    return res.status(500).json({ ok: false, msg: "Error interno" });
  }
}


/**
 * ======================================================
 * ADMIN → HORARIOS MÁS USADOS
 * ======================================================
 */
export async function reporteHorariosMasUsados(req, res) {
  try {
    const sucursalId = req.user?.sucursal;

    const [rows] = await pool.query(
      `SELECT 
          DATE_FORMAT(r.inicio, '%H:%i') AS hora,
          COUNT(*) AS usos
       FROM reserva r
       WHERE r.id_sucursal = ?
       GROUP BY hora
       ORDER BY usos DESC`,
      [sucursalId]
    );

    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error reporte admin B:", err);
    return res.status(500).json({ ok: false, msg: "Error interno" });
  }
}

/**
 * ======================================================
 * ADMIN → HORARIOS CON MENOS USO (VACÍOS)
 * ======================================================
 */
export async function reporteHorariosVacios(req, res) {
  try {
    const sucursalId = req.user?.sucursal;

    const horariosBase = [
      "08:00","09:00","10:00","11:00","12:00",
      "13:00","14:00","15:00","16:00",
      "17:00","18:00","19:00","20:00","21:00","22:00"
    ];

    const [usos] = await pool.query(
      `SELECT 
          DATE_FORMAT(inicio, '%H:%i') AS hora,
          COUNT(*) AS usos
       FROM reserva
       WHERE id_sucursal = ?
       GROUP BY hora`,
      [sucursalId]
    );

    const usadosMap = Object.fromEntries(usos.map((u) => [u.hora, u.usos]));

    const resultado = horariosBase.map((h) => ({
      hora: h,
      usos: usadosMap[h] || 0,
    }));

    return res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error("Error reporte admin C:", err);
    return res.status(500).json({ ok: false, msg: "Error interno" });
  }
}
