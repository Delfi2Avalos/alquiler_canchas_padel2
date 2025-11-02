import { pool } from "../config/db.js";
import { ok, serverError } from "../utils/http.js";

export const listarSucursales = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_sucursal, nombre, ciudad, provincia, hora_apertura, hora_cierre FROM sucursal ORDER BY nombre"
    );
    return ok(res, rows);
  } catch (err) { return serverError(res, err); }
};
