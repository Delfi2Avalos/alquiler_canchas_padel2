import { pool } from "../config/db.js";
import { ok, serverError } from "../utils/http.js";

export const listarCanchasPorSucursal = async (req, res) => {
  try {
    const { sedeId } = req.params;
    const [rows] = await pool.query(
      "SELECT id_cancha, nombre, cubierta, iluminacion, estado FROM cancha WHERE id_sucursal = ? ORDER BY nombre",
      [sedeId]
    );
    return ok(res, rows);
  } catch (err) { return serverError(res, err); }
};
