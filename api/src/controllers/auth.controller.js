import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../middlewares/auth.js";
import { ok, badRequest, serverError, asyncHandler } from "../utils/http.js";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return badRequest(res, "Faltan credenciales");

  const user = String(username).trim();
  const [rows] = await pool.query(
    `SELECT id_usuario, role, username, hash_password, activo
     FROM usuario
     WHERE username = ? LIMIT 1`,
    [user]
  );
  if (!rows.length) return badRequest(res, "Usuario o contraseña inválidos");

  const u = rows[0];
  if (!u.activo) return badRequest(res, "Usuario inactivo");

  const okPass = await bcrypt.compare(password, u.hash_password);
  if (!okPass) return badRequest(res, "Usuario o contraseña inválidos");

  const token = signToken({ id: u.id_usuario, role: u.role, username: u.username });
  return ok(res, { token, user: { id: u.id_usuario, role: u.role, username: u.username } });
});
