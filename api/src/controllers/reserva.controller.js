import { pool } from "../config/db.js";
import {
  ok,
  created,
  badRequest,
  conflict,
  serverError,
} from "../utils/http.js";

// Helpers
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const isISODateTime = (s) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(String(s || ""));

/**
 * GET /api/reservas/disponibilidad?canchaId=&fecha=YYYY-MM-DD
 * Devuelve las reservas existentes de un día
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
 * GET /api/reservas/horarios?canchaId=&fecha=
 * Devuelve horarios LIBRE / OCUPADO
 */
export const horariosDisponibles = async (req, res) => {
  try {
    const canchaId = Number(req.query.canchaId);
    const fecha = req.query.fecha;

    if (!canchaId || !fecha || !isISODate(fecha)) {
      return badRequest(res, "canchaId y fecha (YYYY-MM-DD) son requeridos");
    }

    const horariosBase = [
      "08:00","09:00","10:00","11:00","12:00",
      "13:00","14:00","15:00","16:00",
      "17:00","18:00","19:00","20:00","21:00","22:00"
    ];

    const [reservas] = await pool.query(
      `SELECT inicio
       FROM reserva
       WHERE id_cancha = ?
         AND DATE(inicio) = DATE(?)
         AND estado IN ('PENDIENTE','CONFIRMADA')
       ORDER BY inicio`,
      [canchaId, fecha]
    );

    const ocupados = reservas.map(
      (r) => r.inicio.toISOString().slice(11, 16)
    );

    const respuesta = horariosBase.map((h) => ({
      hora: h,
      estado: ocupados.includes(h) ? "OCUPADO" : "LIBRE",
    }));

    return ok(res, respuesta);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * POST /api/reservas
 * Crea una reserva en estado PENDIENTE
 */
export const crearReserva = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_cancha, inicio, fin, precio_total } = req.body || {};
    const id_usuario = req.user?.id;
    const rol = req.user?.role || req.user?.rol || null;

    if (!id_cancha || !inicio || !fin || precio_total == null) {
      return badRequest(res, "id_cancha, inicio, fin y precio_total son requeridos");
    }
    if (!isISODateTime(inicio) || !isISODateTime(fin)) {
      return badRequest(res, "inicio y fin deben ser formato YYYY-MM-DDTHH:mm");
    }

    const precio = Number(precio_total);
    if (Number.isNaN(precio) || precio < 0) {
      return badRequest(res, "precio_total inválido");
    }

    const senia = Number((precio * 0.3).toFixed(2));

    await conn.beginTransaction();

    const [canchas] = await conn.query(
      `SELECT id_sucursal FROM cancha WHERE id_cancha = ? LIMIT 1`,
      [id_cancha]
    );

    if (!canchas.length) {
      await conn.rollback();
      return badRequest(res, "Cancha inexistente");
    }

    const id_sucursal = canchas[0].id_sucursal;

    if (rol === "ADMIN") {
      const sucAdmin = req.user?.sucursal;
      if (!sucAdmin || sucAdmin !== id_sucursal) {
        await conn.rollback();
        return conflict(res, "No puedes reservar en otra sucursal");
      }
    }

    const [suc] = await conn.query(
      `SELECT hora_apertura, hora_cierre 
       FROM sucursal 
       WHERE id_sucursal = ? LIMIT 1`,
      [id_sucursal]
    );

    if (!suc.length) {
      await conn.rollback();
      return badRequest(res, "Sucursal inexistente");
    }

    const fecha = inicio.slice(0, 10);
    const apertura = `${fecha}T${suc[0].hora_apertura}`;
    const cierre = `${fecha}T${suc[0].hora_cierre}`;

    const rangoOk = inicio >= apertura && fin <= cierre && inicio < fin;
    if (!rangoOk) {
      await conn.rollback();
      return conflict(res, "Fuera del horario de apertura");
    }

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
      return conflict(res, "Horario no disponible");
    }

    const [ins] = await conn.query(
      `INSERT INTO reserva
        (id_sucursal, id_cancha, id_usuario, inicio, fin, estado, precio_total, senia)
       VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?)`,
      [id_sucursal, id_cancha, id_usuario, inicio, fin, precio, senia]
    );

    await conn.commit();

    return created(res, {
      id_reserva: ins.insertId,
      estado: "PENDIENTE",
      precio_total: precio,
      senia,
    });

  } catch (err) {
    await conn.rollback();
    return serverError(res, err);
  } finally {
    conn.release();
  }
};

/**
 * PATCH /api/reservas/:id/estado
 * Cambia estado PENDIENTE → CONFIRMADA o RECHAZADA
 */
export const cambiarEstado = async (req, res) => {
  try {
    const adminSucursal = req.user?.sucursal;
    const rol = req.user?.role || req.user?.rol || null;

    if (rol !== "ADMIN") {
      return badRequest(res, "Solo ADMIN puede cambiar estado");
    }
    if (!adminSucursal) {
      return badRequest(res, "El ADMIN no tiene sucursal asociada");
    }

    const id = Number(req.params.id);
    const { estado } = req.body || {};
    const permitidos = ["CONFIRMADA", "RECHAZADA"];

    if (!id) return badRequest(res, "ID inválido");
    if (!permitidos.includes(estado)) {
      return badRequest(res, "Estado inválido");
    }

    const [rows] = await pool.query(
      `SELECT id_sucursal, estado
       FROM reserva 
       WHERE id_reserva = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return badRequest(res, "Reserva no encontrada");

    const r = rows[0];

    if (r.id_sucursal !== adminSucursal) {
      return conflict(res, "No puedes modificar reservas de otra sucursal");
    }

    if (r.estado !== "PENDIENTE") {
      return conflict(res, "Solo se pueden modificar reservas PENDIENTES");
    }

    await pool.query(`UPDATE reserva SET estado=? WHERE id_reserva=?`, [
      estado,
      id,
    ]);

    return ok(res, { id_reserva: id, estado });
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * GET /api/reservas/mias
 * Lista reservas del usuario logueado
 */
export const listarMisReservas = async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return badRequest(res, "Usuario no identificado");

    const [rows] = await pool.query(
      `SELECT 
          r.id_reserva,
          r.inicio,
          r.fin,
          r.estado,
          r.precio_total,
          r.senia,
          c.nombre AS cancha,
          s.nombre AS sucursal
       FROM reserva r
       JOIN cancha c   ON r.id_cancha = c.id_cancha
       JOIN sucursal s ON r.id_sucursal = s.id_sucursal
       WHERE r.id_usuario = ?
       ORDER BY r.inicio DESC`,
      [uid]
    );

    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * GET /api/reservas/sucursal
 * ADMIN: reservas de su sucursal (filtros opcionales)
 */
export const listarReservasDeMiSucursal = async (req, res) => {
  try {
    const rol = req.user?.role || req.user?.rol || null;
    const sucursalId = req.user?.sucursal;

    if (rol !== "ADMIN") {
      return badRequest(res, "Solo ADMIN puede ver reservas de su sucursal");
    }
    if (!sucursalId) {
      return badRequest(res, "ADMIN sin sucursal asociada");
    }

    const { estado, fecha } = req.query || {};
    const filtros = ["r.id_sucursal = ?"];
    const params = [sucursalId];

    if (estado) {
      filtros.push("r.estado = ?");
      params.push(String(estado).toUpperCase());
    }
    if (fecha && isISODate(fecha)) {
      filtros.push("DATE(r.inicio) = DATE(?)");
      params.push(fecha);
    }

    const where = `WHERE ${filtros.join(" AND ")}`;

    const [rows] = await pool.query(
      `SELECT 
          r.id_reserva,
          r.inicio,
          r.fin,
          r.estado,
          r.precio_total,
          r.senia,
          c.nombre AS cancha,
          u.username AS usuario,
          u.email   AS email_usuario
       FROM reserva r
       JOIN cancha c   ON r.id_cancha = c.id_cancha
       JOIN usuario u  ON r.id_usuario = u.id_usuario
       ${where}
       ORDER BY r.inicio DESC
       LIMIT 500`,
      params
    );

    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * GET /api/reservas/admin
 * SUPERADMIN: reservas globales
 */
export const listarReservasGlobal = async (req, res) => {
  try {
    const rol = req.user?.role || req.user?.rol || null;

    if (rol !== "SUPERADMIN") {
      return badRequest(res, "Solo SUPERADMIN puede ver reservas globales");
    }

    const { sucursalId, estado, fecha } = req.query || {};
    const filtros = [];
    const params = [];

    if (sucursalId) {
      filtros.push("r.id_sucursal = ?");
      params.push(Number(sucursalId));
    }
    if (estado) {
      filtros.push("r.estado = ?");
      params.push(String(estado).toUpperCase());
    }
    if (fecha && isISODate(fecha)) {
      filtros.push("DATE(r.inicio) = DATE(?)");
      params.push(fecha);
    }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT 
          r.id_reserva,
          r.inicio,
          r.fin,
          r.estado,
          r.precio_total,
          r.senia,
          c.nombre AS cancha,
          s.nombre AS sucursal,
          u.username AS usuario,
          u.email AS email_usuario
       FROM reserva r
       JOIN cancha   c ON r.id_cancha = c.id_cancha
       JOIN sucursal s ON r.id_sucursal = s.id_sucursal
       JOIN usuario  u ON r.id_usuario = u.id_usuario
       ${where}
       ORDER BY r.inicio DESC
       LIMIT 1000`,
      params
    );

    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};
