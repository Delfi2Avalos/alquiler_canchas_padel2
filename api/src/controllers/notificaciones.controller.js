import { pool } from "../config/db.js";
import { ok, badRequest, serverError } from "../utils/http.js";


 //ruta: GET /api/notificaciones/mias
 //Trae las notificaciones del usuario logueado
export const misNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.user?.id;

    if (!id_usuario) {
      return badRequest(res, "Usuario no identificado");
    }

    const [rows] = await pool.query(
      `SELECT 
          id_notificacion,
          mensaje,
          creada_en
       FROM notificacion
       WHERE id_usuario = ?
       ORDER BY creada_en DESC`,
      [id_usuario]
    );

    return ok(res, rows);
  } catch (err) {
    console.error("ERROR en notificaciones:", err);
    return serverError(res, err);
  }
};
