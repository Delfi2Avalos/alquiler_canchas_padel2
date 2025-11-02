import { pool } from "../config/db.js";
import { ok, created, badRequest, conflict, serverError } from "../utils/http.js";

export const disponibilidad = async (req, res) => {
  try {
    const { canchaId, fecha } = req.query;
    if (!canchaId || !fecha) return badRequest(res, "canchaId y fecha son requeridos");

    const [rows] = await pool.query(
      `SELECT id_reserva, inicio, fin, estado
       FROM reserva
       WHERE id_cancha = ? AND DATE(inicio) = DATE(?) 
       ORDER BY inicio`,
      [canchaId, fecha]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res, err); }
};

export const crearReserva = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_sucursal, id_cancha, inicio, fin, precio_total } = req.body || {};
    const id_usuario = req.user.id; // del token

    if (!id_sucursal || !id_cancha || !inicio || !fin)
      return badRequest(res, "Campos requeridos: id_sucursal, id_cancha, inicio, fin");

    await conn.beginTransaction();
    const [ins] = await conn.query(
      `INSERT INTO reserva (id_sucursal, id_cancha, id_usuario, inicio, fin, estado, precio_total)
       VALUES (?, ?, ?, ?, ?, 'RESERVADA', ?)`,
      [id_sucursal, id_cancha, id_usuario, inicio, fin, Number(precio_total || 0)]
    );
    await conn.commit();
    return created(res, { id_reserva: ins.insertId });
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

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body || {};
    const permitidos = ['RESERVADA','CONFIRMADA','EN_CURSO','COMPLETADA','CANCELADA','NO_SHOW'];
    if (!permitidos.includes(estado)) return badRequest(res, "Estado inválido");

    await pool.query("UPDATE reserva SET estado = ? WHERE id_reserva = ?", [estado, id]);
    return ok(res, { id_reserva: Number(id), estado });
  } catch (err) { return serverError(res, err); }
};
