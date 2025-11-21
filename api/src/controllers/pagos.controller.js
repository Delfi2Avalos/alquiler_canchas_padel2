import { pool } from "../config/db.js";
import {
  ok,
  created,
  badRequest,
  conflict,
  serverError,
  asyncHandler,
} from "../utils/http.js";

/**
 * POST /api/pagos
 * JUGADOR o ADMIN registran un pago (comprobante)
 */
export const crearPago = asyncHandler(async (req, res) => {
  const { id_reserva, monto, metodo, referencia } = req.body || {};
  const rol = req.user?.role || req.user?.rol || null;
  const adminSucursal = req.user?.sucursal || null;

  if (!id_reserva || !monto) {
    return badRequest(res, "id_reserva y monto son obligatorios");
  }

  const montoNum = Number(monto);
  if (Number.isNaN(montoNum) || montoNum <= 0) {
    return badRequest(res, "Monto inválido");
  }

  const [resv] = await pool.query(
    `
    SELECT r.id_reserva, r.id_sucursal
    FROM reserva r
    WHERE r.id_reserva = ?
    LIMIT 1
  `,
    [id_reserva]
  );

  if (!resv.length) {
    return badRequest(res, "Reserva no encontrada");
  }

  const reservaSucursal = resv[0].id_sucursal;

  if (rol === "ADMIN" && adminSucursal && adminSucursal !== reservaSucursal) {
    return conflict(
      res,
      "No podés registrar pagos de una reserva de otra sucursal"
    );
  }

  // Insertamos usando comprobante_subido_en
  const [ins] = await pool.query(
    `
    INSERT INTO pago (
      id_reserva,
      monto,
      metodo,
      estado,
      referencia,
      comprobante_subido_en
    )
    VALUES (?, ?, ?, 'PENDIENTE', ?, NOW())
  `,
    [id_reserva, montoNum, metodo || null, referencia || null]
  );

  return created(res, {
    id_pago: ins.insertId,
    msg: "Pago registrado correctamente (PENDIENTE)",
  });
});

/**
 * PATCH /api/pagos/:id/estado
 */
export const cambiarEstadoPago = asyncHandler(async (req, res) => {
  const rol = req.user?.role || req.user?.rol || null;
  const adminSucursal = req.user?.sucursal || null;

  if (rol !== "ADMIN") {
    return badRequest(res, "Solo un ADMIN puede cambiar estados de pagos");
  }
  if (!adminSucursal) {
    return badRequest(res, "Tu usuario no tiene sucursal asignada");
  }

  const id = Number(req.params.id);
  const { estado } = req.body || {};
  const permitidos = ["PENDIENTE", "VERIFICADO", "RECHAZADO"];

  if (!id) return badRequest(res, "ID de pago inválido");
  if (!estado || !permitidos.includes(String(estado).toUpperCase())) {
    return badRequest(res, "Estado de pago inválido");
  }

  const [rows] = await pool.query(
    `
    SELECT p.id_pago, r.id_sucursal
    FROM pago p
    JOIN reserva r ON r.id_reserva = p.id_reserva
    WHERE p.id_pago = ?
    LIMIT 1
  `,
    [id]
  );

  if (!rows.length) {
    return badRequest(res, "Pago no encontrado");
  }

  if (rows[0].id_sucursal !== adminSucursal) {
    return conflict(
      res,
      "No podés modificar pagos de otra sucursal diferente a la tuya"
    );
  }

  await pool.query(
    `
    UPDATE pago
    SET estado = ?
    WHERE id_pago = ?
  `,
    [String(estado).toUpperCase(), id]
  );

  return ok(res, { id_pago: id, estado: String(estado).toUpperCase() });
});

/**
 * GET /api/pagos/sucursal
 * ADMIN ve pagos de SU sucursal
 */
export const listarPagosSucursal = asyncHandler(async (req, res) => {
  const rol = req.user?.role || req.user?.rol || null;
  const sucursalId = req.user?.sucursal || null;

  if (rol !== "ADMIN") {
    return badRequest(res, "Solo ADMIN puede ver los pagos de su sucursal");
  }
  if (!sucursalId) {
    return badRequest(res, "Tu usuario no tiene sucursal asignada");
  }

  const { estado, fecha } = req.query || {};

  const filtros = ["r.id_sucursal = ?"];
  const params = [sucursalId];

  if (estado) {
    filtros.push("p.estado = ?");
    params.push(String(estado).toUpperCase());
  }

  if (fecha) {
    filtros.push("DATE(p.comprobante_subido_en) = DATE(?)");
    params.push(fecha);
  }

  const where = "WHERE " + filtros.join(" AND ");

  const [rows] = await pool.query(
    `
    SELECT 
      p.id_pago,
      p.comprobante_subido_en AS fecha,
      p.monto,
      p.metodo,
      p.estado,
      u.username AS jugador,
      c.nombre   AS cancha
    FROM pago p
    JOIN reserva r ON r.id_reserva = p.id_reserva
    JOIN cancha  c ON c.id_cancha = r.id_cancha
    JOIN usuario u ON u.id_usuario = r.id_usuario
    ${where}
    ORDER BY p.comprobante_subido_en DESC
  `,
    params
  );

  return ok(res, rows);
});

/**
 * GET /api/pagos/admin
 * SUPERADMIN ve TODOS los pagos
 */
export const listarPagosGlobal = asyncHandler(async (req, res) => {
  const rol = req.user?.role || req.user?.rol || null;

  if (rol !== "SUPERADMIN") {
    return badRequest(
      res,
      "Solo SUPERADMIN puede ver el listado global de pagos"
    );
  }

  const { sucursalId, estado, fecha } = req.query || {};
  const filtros = [];
  const params = [];

  if (sucursalId) {
    filtros.push("r.id_sucursal = ?");
    params.push(Number(sucursalId));
  }

  if (Estado) {
    filtros.push("p.estado = ?");
    params.push(String(estado).toUpperCase());
  }

  if (fecha) {
    filtros.push("DATE(p.comprobante_subido_en) = DATE(?)");
    params.push(fecha);
  }

  const where = filtros.length ? "WHERE " + filtros.join(" AND ") : "";

  const [rows] = await pool.query(
    `
    SELECT 
      p.id_pago,
      p.comprobante_subido_en AS fecha,
      p.monto,
      p.metodo,
      p.estado,
      s.nombre   AS sucursal,
      c.nombre   AS cancha,
      u.username AS jugador
    FROM pago p
    JOIN reserva  r ON r.id_reserva  = p.id_reserva
    JOIN sucursal s ON s.id_sucursal = r.id_sucursal
    JOIN cancha   c ON c.id_cancha   = r.id_cancha
    JOIN usuario  u ON u.id_usuario  = r.id_usuario
    ${where}
    ORDER BY p.comprobante_subido_en DESC
  `,
    params
  );

  return ok(res, rows);
});
