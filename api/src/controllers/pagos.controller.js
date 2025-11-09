import { pool } from "../config/db.js";
import { ok, created, badRequest, serverError, asyncHandler } from "../utils/http.js";

export const crearPago = asyncHandler(async (req, res) => {
  const { id_reserva, comprobante_url, comprobante_mime, observaciones } = req.body || {};
  if (!id_reserva || !comprobante_url) return badRequest(res, "id_reserva y comprobante_url son requeridos");

  // (opcional) validar existencia de la reserva
  const [r] = await pool.query(`SELECT id_reserva FROM reserva WHERE id_reserva=? LIMIT 1`, [id_reserva]);
  if (!r.length) return badRequest(res, "Reserva inexistente");

  try {
    const [ins] = await pool.query(
      `INSERT INTO pago (id_reserva, comprobante_url, comprobante_mime, observaciones)
       VALUES (?, ?, ?, ?)`,
      [id_reserva, comprobante_url, comprobante_mime || null, observaciones || null]
    );
    return created(res, { id_pago: ins.insertId });
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("uq_pago_unico_reserva")) {
      return badRequest(res, "La reserva ya tiene un pago cargado");
    }
    return serverError(res, err);
  }
});

export const cambiarEstadoPago = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  const permitidos = ["PENDIENTE", "VERIFICADO", "RECHAZADO"];
  if (!id) return badRequest(res, "id inválido");
  if (!permitidos.includes(estado)) return badRequest(res, "Estado de pago inválido");

  await pool.query(`UPDATE pago SET estado = ? WHERE id_pago = ?`, [estado, id]);

  // (opcional) si se verifica el pago → confirmar reserva
  // if (estado === "VERIFICADO") {
  //   await pool.query(`UPDATE reserva SET estado='CONFIRMADA' WHERE id_reserva =
  //                    (SELECT id_reserva FROM pago WHERE id_pago=?)`, [id]);
  // }

  return ok(res, { id_pago: id, estado });
});
