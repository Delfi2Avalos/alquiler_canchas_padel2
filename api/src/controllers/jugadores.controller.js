import { pool } from "../config/db.js";
import { ok, badRequest, serverError } from "../utils/http.js";

/**
 * LISTAR JUGADORES
 * GET /api/jugadores
 */
export const listarJugadores = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, username, email, telefono, dni, activo
       FROM usuario
       WHERE rol = 'JUGADOR'
       ORDER BY nombre`
    );
    return ok(res, rows);
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * ACTUALIZAR JUGADOR
 * PUT /api/jugadores/:id
 */
export const actualizarJugador = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, username, email, telefono, dni, activo } = req.body || {};

    if (!id) return badRequest(res, "ID de jugador inválido");
    if (!nombre || !username || !email || !dni)
      return badRequest(res, "Faltan datos obligatorios");

    await pool.query(
      `UPDATE usuario
       SET nombre = ?, username = ?, email = ?, telefono = ?, dni = ?, activo = ?
       WHERE id_usuario = ? AND rol = 'JUGADOR'`,
      [nombre, username, email, telefono || null, dni, activo ? 1 : 0, id]
    );

    return ok(res, { msg: "Jugador actualizado correctamente" });
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * ELIMINAR JUGADOR (soft delete → activo = 0)
 * DELETE /api/jugadores/:id
 */
export const eliminarJugador = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, "ID de jugador inválido");

    // Para no romper reservas, hacemos borrado lógico:
    await pool.query(
      `UPDATE usuario
       SET activo = 0
       WHERE id_usuario = ? AND rol = 'JUGADOR'`,
      [id]
    );

    return ok(res, { msg: "Jugador desactivado correctamente" });
  } catch (err) {
    return serverError(res, err);
  }
};
