import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js"; // usar pool
import { signToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, msg: "Faltan datos" });

    // Usamos pool.query, no db.query
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
    console.error("Error login:", e); // Esto te va a mostrar el detalle exacto
    res.status(500).json({ ok: false, msg: "Error interno en el login" });
  }
});

export default router;