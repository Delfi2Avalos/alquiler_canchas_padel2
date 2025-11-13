import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js"; // usar pool
import { signToken } from "../middlewares/auth.js";

const router = express.Router();

/**
 * LOGIN DE USUARIO
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, msg: "Faltan datos" });

    // Buscar usuario por username
    const [rows] = await pool.query(
      "SELECT id_usuario, rol, username, hash_password, activo, id_sucursal FROM usuario WHERE username = ? LIMIT 1",
      [username]
    );

    const user = rows[0];
    if (!user || !user.activo)
      return res.status(401).json({ ok: false, msg: "Usuario o contraseña incorrectos" });

    const isMatch = await bcrypt.compare(password, user.hash_password);
    if (!isMatch)
      return res.status(401).json({ ok: false, msg: "Usuario o contraseña incorrectos" });

    // Generar token JWT
    const token = signToken({
      id: user.id_usuario,
      username: user.username,
      role: user.rol,
      sucursal: user.id_sucursal,
    });

    res.json({ ok: true, token });
  } catch (e) {
    console.error("Error login:", e);
    res.status(500).json({ ok: false, msg: "Error interno en el login" });
  }
});

/**
 * REGISTRO DE USUARIO NUEVO
 */
router.post("/register", async (req, res) => {
  try {
    const { nombre, dni, username, email, telefono, password } = req.body;
    if (!nombre || !dni || !username || !email || !password)
      return res.status(400).json({ ok: false, msg: "Faltan datos" });

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 12);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO usuario (rol, nombre, dni, username, email, telefono, hash_password, activo)
       VALUES ('JUGADOR', ?, ?, ?, ?, ?, ?, 1)`,
      [nombre, dni, username, email, telefono, hash]
    );

    // Generar token JWT
    const token = signToken({
      id: result.insertId,
      username,
      role: "JUGADOR",
    });

    res.status(201).json({ ok: true, id_usuario: result.insertId, token });
  } catch (err) {
    console.error("Error en register:", err);
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(400).json({ ok: false, msg: "Usuario, DNI o email ya registrados" });
    } else {
      res.status(500).json({ ok: false, msg: "Error interno en el registro" });
    }
  }
});

export default router;
