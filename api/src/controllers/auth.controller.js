import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../middlewares/auth.js";
import { ok, created, badRequest, serverError } from "../utils/http.js";

// helpers de validación simples
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").toLowerCase());
const isDni = (s) => /^[0-9]{7,10}$/.test(String(s || ""));
const hasMin = (s, n) => String(s || "").length >= n;


 //LOGIN
 //ruta: POST /api/auth/login
export const login = async (req, res) => {
  try {
    let { username, password } = req.body || {};
    if (!username || !password) return badRequest(res, "Faltan credenciales");

    username = String(username).trim().toLowerCase();

    const [rows] = await pool.query(
      `SELECT id_usuario, rol, username, hash_password, activo, id_sucursal
       FROM usuario
       WHERE username = ? 
       LIMIT 1`,
      [username]
    );

    if (!rows.length) return badRequest(res, "Usuario o contraseña inválidos");

    const u = rows[0];
    if (!u.activo) return badRequest(res, "Usuario inactivo");

    const okPass = await bcrypt.compare(password, u.hash_password);
    if (!okPass) return badRequest(res, "Usuario o contraseña inválidos");

    // Payload del JWT:
    // - id: id del usuario
    // - roles: JUGADOR / ADMIN / SUPERADMIN
    // - username
    // - sucursal: id_sucursal (null para jugadores)
    const token = signToken({
      id: u.id_usuario,
      role: u.rol,
      username: u.username,
      sucursal: u.id_sucursal ?? null,
    });

    return ok(res, {
      token,
      user: {
        id: u.id_usuario,
        role: u.rol,
        username: u.username,
        sucursal: u.id_sucursal ?? null,
      },
    });
  } catch (err) {
    return serverError(res, err);
  }
};


 //REGISTRO (rol por defecto: JUGADOR)
 //ruta: POST /api/auth/register

export const register = async (req, res) => {
  try {
    let { nombre, dni, username, email, telefono, password } = req.body || {};

    nombre = String(nombre || "").trim();
    dni = String(dni || "").trim();
    username = String(username || "").trim().toLowerCase();
    email = String(email || "").trim().toLowerCase();
    telefono = telefono ? String(telefono).trim() : null;

    if (!nombre || !dni || !username || !email || !password)
      return badRequest(res, "Faltan datos requeridos");
    if (!isDni(dni)) return badRequest(res, "DNI inválido (7 a 10 dígitos)");
    if (!isEmail(email)) return badRequest(res, "Email inválido");
    if (!hasMin(username, 3)) return badRequest(res, "Username muy corto (min 3)");
    if (!hasMin(password, 6)) return badRequest(res, "Contraseña muy corta (min 6)");

    const hash = await bcrypt.hash(password, 12);

    const [ins] = await pool.query(
      `INSERT INTO usuario (rol, nombre, dni, username, email, telefono, hash_password, activo)
       VALUES ('JUGADOR', ?, ?, ?, ?, ?, ?, 1)`,
      [nombre, dni, username, email, telefono, hash]
    );

    // Jugador no tiene sucursal
    const token = signToken({
      id: ins.insertId,
      role: "JUGADOR",
      username,
      sucursal: null,
    });

    return created(res, {
      id_usuario: ins.insertId,
      username,
      email,
      token,
    });
  } catch (err) {
    const msg = String(err?.message || "");
    if (err?.code === "ER_DUP_ENTRY" || msg.includes("Duplicate entry")) {
      return badRequest(res, "Usuario, DNI o email ya registrados");
    }
    return serverError(res, err);
  }
};


 // PERFIL (requiere token)
 //ruta: GET /api/auth/me
 
export const me = async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return badRequest(res, "Sin usuario");

    const [rows] = await pool.query(
      `SELECT id_usuario, rol, username, email, nombre, dni, telefono, activo, id_sucursal
       FROM usuario
       WHERE id_usuario = ?
       LIMIT 1`,
      [uid]
    );
    if (!rows.length) return badRequest(res, "Usuario no encontrado");

    const u = rows[0];

    return ok(res, {
      id: u.id_usuario,
      rol: u.rol,
      username: u.username,
      email: u.email,
      nombre: u.nombre,
      dni: u.dni,
      telefono: u.telefono,
      activo: u.activo,
      sucursal: u.id_sucursal ?? null,
    });
  } catch (err) {
    return serverError(res, err);
  }
};
