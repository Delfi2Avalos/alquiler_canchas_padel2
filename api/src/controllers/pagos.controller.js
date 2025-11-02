import { pool } from "../config/db.js";
import { ok, created, badRequest, serverError } from "../utils/http.js";

export const crearPago = async (req, res) => {
  try {
    const { id_reserva, comprobante_url, comprobante_mime, observaciones } = req.body || {};
    if (!id_reserva || !comprobante_url) return badRequest(res, "id_reserva y comprobante_url son requeridos");

    const [ins] = await pool.query(
      `INSERT INTO pago (id_reserva, comprobante_url, comprobante_mime, observaciones)
       VALUES (?, ?, ?, ?)`,
      [id_reserva, comprobante_url, comprobante_mime || null, observaciones || null]
    );
    return created(res, { id_pago: ins.insertId });
  } catch (err) {
    if (String(err?.message).includes("uq_pago_unico_reserva")) {
      return badRequest(res, "La reserva ya tiene un pago cargado");
    }
    return serverError(res, err);
  }
};

export const cambiarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body || {};
    const permitidos = ['PENDIENTE','VERIFICADO','RECHAZADO'];
    if (!permitidos.includes(estado)) return badRequest(res, "Estado de pago inválido");

    await pool.query("UPDATE pago SET estado = ? WHERE id_pago = ?", [estado, id]);
    return ok(res, { id_pago: Number(id), estado });
  } catch (err) { return serverError(res, err); }
};
