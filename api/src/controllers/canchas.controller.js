import { pool } from "../config/db.js";
import { ok, badRequest, serverError, asyncHandler } from "../utils/http.js";

export const listarCanchasPorSucursal = asyncHandler(async (req, res) => {
  const sedeId = Number(req.params.sedeId || req.params.id || req.query.sedeId);
  if (!sedeId) return badRequest(res, "sedeId inválido");

  const [rows] = await pool.query(
    `SELECT id_cancha, nombre, cubierta, iluminacion, estado
     FROM cancha
     WHERE id_sucursal = ?
     ORDER BY nombre`,
    [sedeId]
  );
  return ok(res, rows);
});
