import { pool } from "../config/db.js";
import {
  ok,
  created,
  badRequest,
  conflict,
  serverError,
} from "../utils/http.js";

// Helpers simples
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const isISODateTime = (s) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(String(s || ""));

/**
 * GET /api/reservas/disponibilidad?canchaId=&fecha=YYYY-MM-DD
 * - Lista reservas existentes para una cancha en un día
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
 * POST /api/reservas
 * body: { id_cancha, inicio, fin, precio_total }
 *
 * - Requiere auth (JUGADOR o ADMIN)
 * - Siempre obtiene id_sucursal desde la cancha (no confía en el body)
 * - Calcula seña = 30% del precio_total
 * - Crea la reserva en estado PENDIENTE
 */
export const crearReserva = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_cancha, inicio, fin, precio_total } = req.body || {};
    const id_usuario = req.user?.id; // viene del token por requireAuth()
    const rol = req.user?.role || req.user?.rol || null;

    // Validaciones básicas
    if (!id_cancha || !inicio || !fin || precio_total == null) {
      return badRequest(
        res,
        "Campos requeridos: id_cancha, inicio, fin, precio_total"
      );
    }
    if (!isISODateTime(inicio) || !isISODateTime(fin)) {
      return badRequest(
        res,
        "Formato de fecha inválido. Use YYYY-MM-DDTHH:mm"
      );
    }

    const precio = Number(precio_total);
    if (Number.isNaN(precio) || precio < 0) {
      return badRequest(res, "precio_total inválido");
    }

    // Seña 30%
    const senia = Number((precio * 0.3).toFixed(2));

    await conn.beginTransaction();

    // 0) Obtener sucursal desde la cancha
    const [canchas] = await conn.query(
      `SELECT id_sucursal 
       FROM cancha 
       WHERE id_cancha = ? 
       LIMIT 1`,
      [id_cancha]
    );
    if (!canchas.length) {
      await conn.rollback();
      return badRequest(res, "Cancha inexistente");
    }
    const id_sucursal = canchas[0].id_sucursal;

    // Si es ADMIN, verificar que la cancha pertenezca a su sucursal
    if (rol === "ADMIN") {
      const sucAdmin = req.user?.sucursal;
      if (!sucAdmin || sucAdmin !== id_sucursal) {
        await conn.rollback();
        return conflict(
          res,
          "No puedes reservar en una cancha de otra sucursal"
        );
      }
    }

    // 1) Validar sucursal y horario
    const [suc] = await conn.query(
      `SELECT hora_apertura, hora_cierre 
       FROM sucursal 
       WHERE id_sucursal=? 
       LIMIT 1`,
      [id_sucursal]
    );
    if (!suc.length) {
      await conn.rollback();
      return badRequest(res, "Sucursal inexistente");
    }

    const fecha = inicio.slice(0, 10); // YYYY-MM-DD
    const apertura = `${fecha}T${suc[0].hora_apertura}`;
    const cierre = `${fecha}T${suc[0].hora_cierre}`;

    // inicio < fin y dentro del horario de la sucursal
    const rangoOk = inicio >= apertura && fin <= cierre && inicio < fin;
    if (!rangoOk) {
      await conn.rollback();
      return conflict(
        res,
        "Fuera del horario de apertura o rango inválido para la sucursal"
      );
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

    // 3) Insertar reserva en estado PENDIENTE
    const [ins] = await conn.query(
      `INSERT INTO reserva
         (id_sucursal, id_cancha, id_usuario, inicio, fin, estado, precio_total, senia)
       VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?)`,
      [id_sucursal, id_cancha, id_usuario || null, inicio, fin, precio, senia]
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
    const msg = String(err?.message || "");
    if (msg.includes("Fuera del horario")) {
      return conflict(res, "Fuera del horario de apertura");
    }
    if (msg.includes("solapado")) {
      return conflict(res, "Horario no disponible");
    }
    if (msg.includes("Rango inválido")) {
      return badRequest(res, "Rango inválido");
    }
    return serverError(res, err);
  } finally {
    conn.release();
  }
};

/**
 * PATCH /api/reservas/:id/estado
 * body: { estado } con uno de:
 *  'CONFIRMADA','RECHAZADA'
 *
 * - Solo ADMIN
 * - Solo permite cambiar estado de reservas de su sucursal
 * - Solo si la reserva está PENDIENTE
 */
export const cambiarEstado = async (req, res) => {
  try {
    const adminSucursal = req.user?.sucursal;
    const rol = req.user?.role || req.user?.rol || null;

    if (rol !== "ADMIN") {
      return badRequest(res, "Solo un ADMIN puede cambiar el estado");
    }
    if (!adminSucursal) {
      return badRequest(res, "El ADMIN no tiene sucursal asociada");
    }

    const id = Number(req.params.id);
    const { estado } = req.body || {};
    const permitidos = ["CONFIRMADA", "RECHAZADA"];

    if (!id) return badRequest(res, "id inválido");
    if (!permitidos.includes(estado)) {
      return badRequest(res, "Estado inválido (solo CONFIRMADA o RECHAZADA)");
    }

    // Verificar que la reserva pertenece a la sucursal del admin y que está PENDIENTE
    const [rows] = await pool.query(
      `SELECT id_sucursal, estado
       FROM reserva 
       WHERE id_reserva = ? 
       LIMIT 1`,
      [id]
    );
    if (!rows.length) {
      return badRequest(res, "Reserva no encontrada");
    }

    const r = rows[0];

    if (r.id_sucursal !== adminSucursal) {
      return conflict(
        res,
        "No puedes modificar reservas de otra sucursal"
      );
    }

    if (r.estado !== "PENDIENTE") {
      return conflict(
        res,
        "Solo se pueden confirmar o rechazar reservas PENDIENTES"
      );
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
 * - Lista reservas del usuario autenticado (JUGADOR o ADMIN)
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
 * - ADMIN: lista reservas de su sucursal
 *   Opcional: filtrar por estado y/o fecha (YYYY-MM-DD)
 *   Query params:
 *     - estado (opcional)
 *     - fecha  (opcional, YYYY-MM-DD)
 */
export const listarReservasDeMiSucursal = async (req, res) => {
  try {
    const rol = req.user?.role || req.user?.rol || null;
    const sucursalId = req.user?.sucursal;

    if (rol !== "ADMIN") {
      return badRequest(res, "Solo ADMIN puede ver reservas de su sucursal");
    }
    if (!sucursalId) {
      return badRequest(res, "El ADMIN no tiene sucursal asociada");
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
 * - SUPERADMIN: ver todas las reservas de todas las sucursales
 *   Query params:
 *     - sucursalId (opcional)
 *     - estado     (opcional)
 *     - fecha      (opcional, YYYY-MM-DD)
 */
export const listarReservasGlobal = async (req, res) => {
  try {
    const rol = req.user?.role || req.user?.rol || null;
    if (rol !== "SUPERADMIN") {
      return badRequest(
        res,
        "Solo SUPERADMIN puede ver el listado global de reservas"
      );
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
          c.nombre      AS cancha,
          s.nombre      AS sucursal,
          u.username    AS usuario,
          u.email       AS email_usuario
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
