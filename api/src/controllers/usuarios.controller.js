import { pool } from "../config/db.js";
import { ok, badRequest, serverError } from "../utils/http.js";


//OBTENER PERFIL DEL USUARIO LOGUEADO
export async function getPerfil(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return badRequest(res, "ID de usuario faltante.");

    const [rows] = await pool.query(
      `SELECT 
          id_usuario AS id,
          rol,
          username,
          nombre,
          dni,
          telefono,
          email
       FROM usuario
       WHERE id_usuario = ?`,
      [userId]
    );

    if (!rows.length) return badRequest(res, "Usuario no encontrado");

    return ok(res, rows[0]);
  } catch (error) {
    console.error(error);
    return serverError(res, error);
  }
}


//ACTUALIZAR PERFIL DEL USUARIO  
export async function actualizarPerfil(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return badRequest(res, "ID de usuario faltante.");

    const { nombre, dni, telefono, email } = req.body;

    //ACTUALIZAR
    await pool.query(
      `UPDATE usuario 
       SET nombre = ?, dni = ?, telefono = ?, email = ?
       WHERE id_usuario = ?`,
      [nombre, dni, telefono, email, userId]
    );
    
    //DEVOLVER DATOS ACTUALIZADOS
    const [rows] = await pool.query(
      `SELECT 
          id_usuario AS id,
          rol,
          username,
          nombre,
          dni,
          telefono,
          email
       FROM usuario
       WHERE id_usuario = ?`,
      [userId]
    );

    return ok(res, rows[0]);
  } catch (error) {
    console.error(error);
    return serverError(res, error);
  }
}
