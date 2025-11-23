import { pool } from "../config/db.js";

//ruta: GET /api/jugadores  (solo SUPERADMIN)
export const listarJugadores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        id_usuario,
        nombre,
        username,
        email,
        telefono,
        dni,
        activo
      FROM usuario           
      WHERE rol = 'JUGADOR'
      ORDER BY nombre ASC
      `
    );

    return res.json({ ok: true, jugadores: rows });
  } catch (error) {
    console.error("Error en listarJugadores:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al listar jugadores",
      error: error.message,
    });
  }
};

//ruta: PUT /api/jugadores/:id  (actualizar datos)
export const actualizarJugador = async (req, res) => {
  const { id } = req.params;
  const { nombre, username, email, telefono, dni, activo } = req.body;

  try {
    await pool.query(
      `
      UPDATE usuario
      SET 
        nombre   = ?,
        username = ?,
        email    = ?,
        telefono = ?,
        dni      = ?,
        activo   = ?
      WHERE id_usuario = ?
      `,
      [
        nombre,
        username,
        email,
        telefono || null,
        dni,
        activo ? 1 : 0,
        id,
      ]
    );

    return res.json({ ok: true, msg: "Jugador actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualizarJugador:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al actualizar jugador",
      error: error.message,
    });
  }
};

//ruta: DELETE /api/jugadores/:id  
export const desactivarJugador = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `
      UPDATE usuario
      SET activo = 0
      WHERE id_usuario = ?
      `,
      [id]
    );

    return res.json({ ok: true, msg: "Jugador desactivado correctamente" });
  } catch (error) {
    console.error("Error en desactivarJugador:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al desactivar jugador",
      error: error.message,
    });
  }
};
