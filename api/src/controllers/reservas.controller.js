// api/src/controllers/reservas.controller.js
import { pool } from "../config/db.js";
import { ok, created, badRequest, conflict, serverError } from "../utils/http.js";

// Helpers simples
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const isISODateTime = (s) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(String(s || ""));

/**
 * GET /reservas/disponibilidad?canchaId=&fecha=YYYY-MM-DD
 * Lista reservas existentes para una cancha en un día (para armar el calendario)
 */
export const disponibilidad = async (req, res) => {
  try {
    const canchaId = Number(req.query.canchaId);
    const fecha = req.query.fecha;

    if (!canchaId || !fecha || !isISODate(fecha)) {
      return badRequest(res, "canchaId y fecha (YYYY-MM-DD) son requeridos");
    }

    const [rows] = await pool.query(
      `SELECT id_reserva, inicio, fin, estado
       FROM reserva
       WHERE id_cancha = ? AND DATE(inicio) = DATE(?)
       ORDER BY inicio`,
      [canchaId, fecha]
    );

    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * POST /reservas
 * body: { id_sucursal, id_cancha, inicio, fin, precio_total }
 * Requiere auth (JUGADOR/ADMIN). Calcula y guarda seña = 30% de precio_total.
 */
export const crearReserva = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_sucursal, id_cancha, inicio, fin, precio_total } = req.body || {};
    const id_usuario = req.user?.id; // viene del token por requireAuth()

    // Validaciones básicas
    if (!id_sucursal || !id_cancha || !inicio || !fin || precio_total == null) {
      return badRequest(res, "Campos requeridos: id_sucursal, id_cancha, inicio, fin, precio_total");
    }
    if (!isISODateTime(inicio) || !isISODateTime(fin)) {
      return badRequest(res, "Formato de fecha inválido. Use YYYY-MM-DDTHH:mm");
    }

    const precio = Number(precio_total);
    if (Number.isNaN(precio) || precio < 0) {
      return badRequest(res, "precio_total inválido");
    }

    // Seña 30%
    const senia = Number((precio * 0.30).toFixed(2));

    await conn.beginTransaction();

    // 1) Validar sucursal y horario
    const [suc] = await conn.query(
      `SELECT hora_apertura, hora_cierre FROM sucursal WHERE id_sucursal=? LIMIT 1`,
      [id_sucursal]
    );
    if (!suc.length) {
      await conn.rollback();
      return badRequest(res, "Sucursal inexistente");
    }
    const fecha = inicio.slice(0, 10); // YYYY-MM-DD
    const apertura = `${fecha}T${suc[0].hora_apertura}`;
    const cierre   = `${fecha}T${suc[0].hora_cierre}`;

    // inicio < fin y dentro del horario de la sucursal
    const rangoOk = (inicio >= apertura && fin <= cierre && inicio < fin);
    if (!rangoOk) {
      await conn.rollback();
      return conflict(res, "Fuera del horario de apertura o rango inválido");
    }

    // 2) Validar solapamientos en la misma cancha y fecha
    const [overlaps] = await conn.query(
      `SELECT 1
       FROM reserva
       WHERE id_cancha = ?
         AND DATE(inicio) = DATE(?)
         AND NOT (fin <= ? OR inicio >= ?)
       LIMIT 1`,
      [id_cancha, inicio, inicio, fin]
    );
    if (overlaps.length) {
      await conn.rollback();
      return conflict(res, "Horario no disponible (solapado)");
    }

    // 3) Insertar reserva
    const [ins] = await conn.query(
      `INSERT INTO reserva
         (id_sucursal, id_cancha, id_usuario, inicio, fin, estado, precio_total, senia)
       VALUES (?, ?, ?, ?, ?, 'RESERVADA', ?, ?)`,
      [id_sucursal, id_cancha, id_usuario || null, inicio, fin, precio, senia]
    );

    await conn.commit();
    return created(res, {
      id_reserva: ins.insertId,
      estado: "RESERVADA",
      precio_total: precio,
      senia
    });
  } catch (err) {
    await conn.rollback();
    const msg = String(err?.message || "");
    if (msg.includes("Fuera del horario")) return conflict(res, "Fuera del horario de apertura");
    if (msg.includes("Ya hay una reserva")) return conflict(res, "Horario no disponible");
    if (msg.includes("Rango inválido")) return badRequest(res, "Rango inválido");
    return serverError(res, err);
  } finally {
    conn.release();
  }
};

/**
 * PATCH /reservas/:id/estado
 * body: { estado } con uno de:
 *  'RESERVADA','CONFIRMADA','EN_CURSO','COMPLETADA','CANCELADA','NO_SHOW'
 * (normalmente protegido para ADMIN)
 */
export const cambiarEstado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body || {};
    const permitidos = ["RESERVADA","CONFIRMADA","EN_CURSO","COMPLETADA","CANCELADA","NO_SHOW"];

    if (!id) return badRequest(res, "id inválido");
    if (!permitidos.includes(estado)) return badRequest(res, "Estado inválido");

    await pool.query(`UPDATE reserva SET estado=? WHERE id_reserva=?`, [estado, id]);
    return ok(res, { id_reserva: id, estado });
  } catch (err) {
    return serverError(res, err);
  }
};
