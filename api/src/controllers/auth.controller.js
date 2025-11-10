import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../middlewares/auth.js";
import { ok, badRequest, serverError } from "../utils/http.js";

/**
 * ======================
 * LOGIN DE USUARIO
 * ======================
 * Verifica credenciales y genera token JWT
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return badRequest(res, "Faltan credenciales");

    const [rows] = await pool.query(
      `SELECT id_usuario, role, username, hash_password, activo
       FROM usuario
       WHERE username = ? LIMIT 1`,
      [username]
    );

    if (!rows.length)
      return badRequest(res, "Usuario o contraseña inválidos");

    const u = rows[0];
    if (!u.activo)
      return badRequest(res, "Usuario inactivo");

    const okPass = await bcrypt.compare(password, u.hash_password);
    if (!okPass)
      return badRequest(res, "Usuario o contraseña inválidos");

    const token = signToken({
      id: u.id_usuario,
      role: u.role,
      username: u.username,
    });

    return ok(res, {
      token,
      user: { id: u.id_usuario, role: u.role, username: u.username },
    });
  } catch (err) {
    return serverError(res, err);
  }
};

/**
 * ======================
 * REGISTRO DE USUARIO
 * ======================
 * Crea nuevos usuarios (por defecto JUGADOR)
 * con contraseña hasheada
 */
export const register = async (req, res) => {
  try {
    const { nombre, dni, username, email, telefono, password } = req.body || {};

    if (!nombre || !dni || !username || !email || !password)
      return badRequest(res, "Faltan datos requeridos");

    // Verificar si ya existe un usuario con ese username o DNI
    const [exist] = await pool.query(
      `SELECT 1 FROM usuario WHERE username = ? OR dni = ? LIMIT 1`,
      [username, dni]
    );
    if (exist.length)
      return badRequest(res, "El usuario o DNI ya existen");

    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 12);

    // Insertar nuevo usuario (rol por defecto = JUGADOR)
    const [ins] = await pool.query(
      `INSERT INTO usuario (role, nombre, dni, username, email, telefono, hash_password, activo)
       VALUES ('JUGADOR', ?, ?, ?, ?, ?, ?, 1)`,
      [nombre, dni, username, email, telefono || null, hash]
    );

    return ok(res, {
      id_usuario: ins.insertId,
      username,
      email,
    });
  } catch (err) {
    return serverError(res, err);
  }
};
