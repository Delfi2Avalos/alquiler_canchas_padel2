import { Router } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

const router = Router();

//ruta: GET /api/admins
//Lista todos los administradores del sistema.
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.username, u.email, u.telefono,
             u.id_sucursal, s.nombre AS sucursal
      FROM usuario u
      LEFT JOIN sucursal s ON s.id_sucursal = u.id_sucursal
      WHERE u.rol = 'ADMIN'
    `);

    res.json({ ok: true, admins: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error obteniendo admins" });
  }
});


 //ruta: POST /api/admins
 //Crea un nuevo admin (CON SUCURSAL OBLIGATORIA)
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      username,
      email,
      telefono = null,
      dni,
      password,
      id_sucursal,
    } = req.body;

    if (!nombre || !username || !email || !dni || !password || !id_sucursal) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan datos (la sucursal es obligatoria)",
      });
    }

    // Hash del password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query(
      `
      INSERT INTO usuario 
      (rol, nombre, username, email, telefono, dni, hash_password, id_sucursal)
      VALUES ('ADMIN', ?, ?, ?, ?, ?, ?, ?)
      `,
      [nombre, username, email, telefono, dni, hash, Number(id_sucursal)]
    );

    res.json({ ok: true, msg: "Admin creado correctamente" });
  } catch (error) {
    console.error("Error creando admin:", error);
    res.status(500).json({ ok: false, msg: "Error creando admin" });
  }
});


 //ruta: PUT /api/admins/:id
 //Edita un admin existente (también exige sucursal)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono = null, id_sucursal } = req.body;

    if (!nombre || !email || !id_sucursal) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan datos (la sucursal es obligatoria)",
      });
    }

    await pool.query(
      `
      UPDATE usuario 
      SET nombre=?, email=?, telefono=?, id_sucursal=?
      WHERE id_usuario=? AND rol='ADMIN'
      `,
      [nombre, email, telefono, Number(id_sucursal), id]
    );

    res.json({ ok: true, msg: "Admin actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error actualizando admin" });
  }
});


 //ruta: DELETE /api/admins/:id
 //Elimina un admin
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM usuario WHERE id_usuario=? AND rol='ADMIN'",
      [id]
    );

    res.json({ ok: true, msg: "Admin eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error eliminando admin" });
  }
});

export default router;
