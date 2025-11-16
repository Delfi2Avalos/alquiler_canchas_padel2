import { pool } from "../config/db.js";
import {
  ok,
  badRequest,
  serverError,
  asyncHandler,
} from "../utils/http.js";

/**
 * LISTADO PÚBLICO POR SUCURSAL
 * GET /api/canchas/sucursal/:sedeId
 * - Para jugadores / público (no necesita token)
 */
export const listarCanchasPorSucursalPublic = asyncHandler(async (req, res) => {
  const sedeId = Number(
    req.params.sedeId || req.params.id || req.query.sedeId
  );
  if (!sedeId) return badRequest(res, "sedeId inválido");

  const [rows] = await pool.query(
    `SELECT 
        id_cancha,
        nombre,
        cubierta,
        iluminacion,
        estado
     FROM cancha
     WHERE id_sucursal = ?
     ORDER BY nombre`,
    [sedeId]
  );
  return ok(res, rows);
});

/**
 * LISTAR CANCHAS DE MI SUCURSAL (SOLO ADMIN)
 * GET /api/canchas/mi
 * - Usa req.user.sucursal (id_sucursal del admin)
 */
export const listarCanchasDeMiSucursal = asyncHandler(async (req, res) => {
  const sucursalId = req.user?.sucursal;
  if (!sucursalId) {
    return badRequest(res, "El usuario no tiene sucursal asociada");
  }

  const [rows] = await pool.query(
    `SELECT 
        id_cancha,
        id_sucursal,
        nombre,
        cubierta,
        iluminacion,
        estado
     FROM cancha
     WHERE id_sucursal = ?
     ORDER BY nombre`,
    [sucursalId]
  );

  return ok(res, rows);
});

/**
 * CREAR CANCHA EN MI SUCURSAL (SOLO ADMIN)
 * POST /api/canchas/
 *
 * Body esperado:
 * - nombre (string, requerido)
 * - cubierta (boolean, opcional, default false)
 * - iluminacion (boolean, opcional, default true)
 * - estado ('ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO', opcional, default 'ACTIVA')
 */
export const crearCanchaEnMiSucursal = asyncHandler(async (req, res) => {
  const sucursalId = req.user?.sucursal;
  if (!sucursalId) {
    return badRequest(res, "El usuario no tiene sucursal asociada");
  }

  let { nombre, cubierta, iluminacion, estado } = req.body || {};

  nombre = String(nombre || "").trim();
  if (!nombre) {
    return badRequest(res, "El nombre de la cancha es requerido");
  }

  // Normalizar valores
  const cubiertaBool =
    typeof cubierta === "boolean"
      ? cubierta
      : cubierta === "1" || cubierta === 1;
  const iluminacionBool =
    typeof iluminacion === "boolean"
      ? iluminacion
      : iluminacion === "1" || iluminacion === 1;

  const estadoVal = ["ACTIVA", "INACTIVA", "MANTENIMIENTO"].includes(
    String(estado || "").toUpperCase()
  )
    ? String(estado).toUpperCase()
    : "ACTIVA";

  try {
    const [ins] = await pool.query(
      `INSERT INTO cancha 
         (id_sucursal, nombre, cubierta, iluminacion, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [sucursalId, nombre, cubiertaBool ? 1 : 0, iluminacionBool ? 1 : 0, estadoVal]
    );

    return ok(res, {
      id_cancha: ins.insertId,
      msg: "Cancha creada correctamente",
    });
  } catch (err) {
    const msg = String(err?.message || "");
    if (err?.code === "ER_DUP_ENTRY" || msg.includes("uq_cancha_nombre")) {
      return badRequest(
        res,
        "Ya existe una cancha con ese nombre en esta sucursal"
      );
    }
    return serverError(res, err);
  }
});

/**
 * ACTUALIZAR CANCHA DE MI SUCURSAL (SOLO ADMIN)
 * PUT /api/canchas/:id
 *
 * - Solo permite modificar canchas cuya id_sucursal = req.user.sucursal
 */
export const actualizarCanchaDeMiSucursal = asyncHandler(async (req, res) => {
  const sucursalId = req.user?.sucursal;
  if (!sucursalId) {
    return badRequest(res, "El usuario no tiene sucursal asociada");
  }

  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return badRequest(res, "ID de cancha inválido");
  }

  let { nombre, cubierta, iluminacion, estado } = req.body || {};

  nombre = String(nombre || "").trim();
  if (!nombre) {
    return badRequest(res, "El nombre de la cancha es requerido");
  }

  const cubiertaBool =
    typeof cubierta === "boolean"
      ? cubierta
      : cubierta === "1" || cubierta === 1;
  const iluminacionBool =
    typeof iluminacion === "boolean"
      ? iluminacion
      : iluminacion === "1" || iluminacion === 1;

  const estadoVal = ["ACTIVA", "INACTIVA", "MANTENIMIENTO"].includes(
    String(estado || "").toUpperCase()
  )
    ? String(estado).toUpperCase()
    : "ACTIVA";

  try {
    const [upd] = await pool.query(
      `UPDATE cancha
       SET nombre = ?,
           cubierta = ?,
           iluminacion = ?,
           estado = ?
       WHERE id_cancha = ?
         AND id_sucursal = ?`,
      [
        nombre,
        cubiertaBool ? 1 : 0,
        iluminacionBool ? 1 : 0,
        estadoVal,
        id,
        sucursalId,
      ]
    );

    if (upd.affectedRows === 0) {
      return badRequest(
        res,
        "Cancha no encontrada o no pertenece a tu sucursal"
      );
    }

    return ok(res, { msg: "Cancha actualizada correctamente" });
  } catch (err) {
    const msg = String(err?.message || "");
    if (err?.code === "ER_DUP_ENTRY" || msg.includes("uq_cancha_nombre")) {
      return badRequest(
        res,
        "Ya existe una cancha con ese nombre en esta sucursal"
      );
    }
    return serverError(res, err);
  }
});

/**
 * ELIMINAR CANCHA DE MI SUCURSAL (SOLO ADMIN)
 * DELETE /api/canchas/:id
 *
 * - Solo elimina si la cancha pertenece a la sucursal del admin
 */
export const eliminarCanchaDeMiSucursal = asyncHandler(async (req, res) => {
  const sucursalId = req.user?.sucursal;
  if (!sucursalId) {
    return badRequest(res, "El usuario no tiene sucursal asociada");
  }

  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return badRequest(res, "ID de cancha inválido");
  }

  const [del] = await pool.query(
    `DELETE FROM cancha
     WHERE id_cancha = ?
       AND id_sucursal = ?`,
    [id, sucursalId]
  );

  if (del.affectedRows === 0) {
    return badRequest(
      res,
      "Cancha no encontrada o no pertenece a tu sucursal"
    );
  }

  return ok(res, { msg: "Cancha eliminada correctamente" });
});
