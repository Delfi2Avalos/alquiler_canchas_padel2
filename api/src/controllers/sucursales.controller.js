import { pool } from "../config/db.js";
import { ok, serverError, asyncHandler } from "../utils/http.js";

export const listarSucursales = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id_sucursal, nombre, ciudad, provincia, hora_apertura, hora_cierre
     FROM sucursal
     ORDER BY nombre`
  );
  return ok(res, rows);
});
