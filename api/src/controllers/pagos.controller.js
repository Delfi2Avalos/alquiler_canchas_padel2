import { pool } from "../config/db.js";
import { ok, created, badRequest, serverError, conflict } from "../utils/http.js";

/**
 * ======================
 * CREAR PAGO
 * ======================
 * Registra un pago asociado a una reserva.
 * Valida que el monto pagado sea >= seña (30% del total).
 */
export const crearPago = async (req, res) => {
  try {
    const { id_reserva, monto, comprobante_url, comprobante_mime, observaciones } = req.body || {};

    if (!id_reserva || !monto || !comprobante_url)
      return badRequest(res, "id_reserva, monto y comprobante_url son requeridos");

    const pago = Number(monto);
    if (Number.isNaN(pago) || pago <= 0)
      return badRequest(res, "monto inválido");

    // Traer la reserva para validar seña
    const [reservaRows] = await pool.query(
      `SELECT id_reserva, senia, estado 
       FROM reserva 
       WHERE id_reserva = ? 
       LIMIT 1`,
      [id_reserva]
    );

    if (!reservaRows.length)
      return badRequest(res, "Reserva inexistente");

    const { senia, estado } = reservaRows[0];

    if (["CANCELADA", "NO_SHOW"].includes(estado))
      return conflict(res, "La reserva no admite pagos");

    // Validar que el monto pagado sea al menos igual a la seña
    if (pago + 1e-6 < Number(senia)) {
      return badRequest(res, `El pago debe ser al menos la seña (${Number(senia).toFixed(2)})`);
    }

    // Insertar el pago
    const [insert] = await pool.query(
      `INSERT INTO pago (id_reserva, estado, monto, comprobante_url, comprobante_mime, observaciones)
       VALUES (?, 'PENDIENTE', ?, ?, ?, ?)`,
      [id_reserva, pago, comprobante_url, comprobante_mime || null, observaciones || null]
    );

    return created(res, {
      id_pago: insert.insertId,
      id_reserva,
      monto: pago,
      estado: "PENDIENTE",
      msg: "Pago registrado correctamente. Pendiente de verificación."
    });
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("uq_pago_unico_reserva")) {
      return badRequest(res, "La reserva ya tiene un pago registrado");
    }
    return serverError(res, err);
  }
};

/**
 * ======================
 * LISTAR PAGOS
 * ======================
 * GET /pagos
 * Devuelve todos los pagos registrados con info básica.
 */
export const listarPagos = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_pago, p.id_reserva, p.monto, p.estado,
        p.comprobante_url, p.comprobante_subido_en,
        r.senia, r.precio_total, r.estado AS estado_reserva
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      ORDER BY p.comprobante_subido_en DESC
    `);
    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * ======================
 * CAMBIAR ESTADO DE PAGO
 * ======================
 * PATCH /pagos/:id
 * body: { estado } con uno de: 'PENDIENTE','VERIFICADO','RECHAZADO'
 */
export const cambiarEstadoPago = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body || {};
    const permitidos = ["PENDIENTE", "VERIFICADO", "RECHAZADO"];

    if (!id || !permitidos.includes(estado))
      return badRequest(res, "Estado inválido o id faltante");

    await pool.query(`UPDATE pago SET estado=? WHERE id_pago=?`, [estado, id]);
    return ok(res, { id_pago: id, nuevo_estado: estado });
  } catch (err) {
    return serverError(res, err);
  }
};
