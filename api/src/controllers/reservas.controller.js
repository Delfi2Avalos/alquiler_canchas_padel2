import { pool } from "../config/db.js";
import { ok, created, badRequest, conflict, serverError, asyncHandler } from "../utils/http.js";

const isISODateTime = (s) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(String(s));
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));

export const disponibilidad = asyncHandler(async (req, res) => {
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
});

export const crearReserva = asyncHandler(async (req, res) => {
  const { id_sucursal, id_cancha, inicio, fin, precio_total } = req.body || {};
  const id_usuario = req.user?.id;

  if (!id_sucursal || !id_cancha || !inicio || !fin)
    return badRequest(res, "Campos requeridos: id_sucursal, id_cancha, inicio, fin");
  if (!isISODateTime(inicio) || !isISODateTime(fin))
    return badRequest(res, "Formato de fecha inválido. Use YYYY-MM-DDTHH:mm");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Validar horario de la sucursal (apertura/cierre del día de la reserva)
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
    if (!(inicio >= apertura && fin <= cierre && inicio < fin)) {
      await conn.rollback();
      return conflict(res, "Fuera del horario de apertura o rango inválido");
    }

    // 2) Validar solapamientos con reservas existentes
    const [ch] = await conn.query(
      `SELECT 1 FROM reserva
       WHERE id_cancha=? AND DATE(inicio)=DATE(?)
       AND NOT (fin <= ? OR inicio >= ?)
       LIMIT 1`,
      [id_cancha, inicio, inicio, fin]
    );
    if (ch.length) {
      await conn.rollback();
      return conflict(res, "Horario no disponible (solapado)");
    }

    // (Opcional) validar bloqueos/mantenimientos si tenés esa tabla
    // const [mant] = await conn.query(...);

    // 3) Insert
    const [ins] = await conn.query(
      `INSERT INTO reserva (id_sucursal, id_cancha, id_usuario, inicio, fin, estado, precio_total)
       VALUES (?, ?, ?, ?, ?, 'RESERVADA', ?)`,
      [id_sucursal, id_cancha, id_usuario || null, inicio, fin, Number(precio_total || 0)]
    );

    await conn.commit();
    return created(res, { id_reserva: ins.insertId, estado: "RESERVADA" });
  } catch (err) {
    await conn.rollback();
    return serverError(res, err);
  } finally {
    conn.release();
  }
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  const permitidos = ["RESERVADA","CONFIRMADA","EN_CURSO","COMPLETADA","CANCELADA","NO_SHOW"];

  if (!id) return badRequest(res, "id inválido");
  if (!permitidos.includes(estado)) return badRequest(res, "Estado inválido");

  await pool.query(`UPDATE reserva SET estado=? WHERE id_reserva=?`, [estado, id]);
  return ok(res, { id_reserva: id, estado });
});
