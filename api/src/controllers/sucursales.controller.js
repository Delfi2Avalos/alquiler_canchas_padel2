import { pool } from "../config/db.js";
import {
  ok,
  created,
  badRequest,
  serverError,
  asyncHandler,
} from "../utils/http.js";


 //LISTADO PÚBLICO DE SUCURSALES
 //ruta: GET /api/sucursales/
 //Para jugadores / público general
export const listarSucursalesPublic = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id_sucursal, nombre, ciudad, provincia, hora_apertura, hora_cierre
     FROM sucursal
     ORDER BY nombre`
  );
  return ok(res, rows);
});


//LISTADO COMPLETO (SOLO SUPERADMIN)
//ruta: GET /api/sucursales/admin
//Devuelve todas las sucursales con más detalles
export const listarSucursalesAdmin = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT 
        id_sucursal,
        nombre,
        email,
        telefono,
        direccion,
        ciudad,
        provincia,
        hora_apertura,
        hora_cierre
     FROM sucursal
     ORDER BY nombre`
  );
  return ok(res, rows);
});


//CREAR SUCURSAL (SOLO SUPERADMIN)
//ruta: POST /api/sucursales/
export const crearSucursal = asyncHandler(async (req, res) => {
  const {
    nombre,
    email,
    telefono,
    direccion,
    ciudad,
    provincia,
    hora_apertura,
    hora_cierre,
  } = req.body || {};

  if (!nombre || String(nombre).trim() === "") {
    return badRequest(res, "El nombre de la sucursal es requerido");
  }

  const [result] = await pool.query(
    `INSERT INTO sucursal 
       (nombre, email, telefono, direccion, ciudad, provincia, hora_apertura, hora_cierre)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(nombre).trim(),
      email ? String(email).trim() : null,
      telefono ? String(telefono).trim() : null,
      direccion ? String(direccion).trim() : null,
      ciudad ? String(ciudad).trim() : null,
      provincia ? String(provincia).trim() : null,
      hora_apertura || "08:00:00",
      hora_cierre || "23:00:00",
    ]
  );

  return created(res, {
    id_sucursal: result.insertId,
    msg: "Sucursal creada correctamente",
  });
});


//ACTUALIZAR SUCURSAL (SOLO SUPERADMIN)
//ruta: PUT /api/sucursales/:id
export const actualizarSucursal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (!idNum || Number.isNaN(idNum)) {
    return badRequest(res, "ID de sucursal inválido");
  }

  const {
    nombre,
    email,
    telefono,
    direccion,
    ciudad,
    provincia,
    hora_apertura,
    hora_cierre,
  } = req.body || {};

  if (!nombre || String(nombre).trim() === "") {
    return badRequest(res, "El nombre de la sucursal es requerido");
  }

  const [result] = await pool.query(
    `UPDATE sucursal
     SET nombre = ?,
         email = ?,
         telefono = ?,
         direccion = ?,
         ciudad = ?,
         provincia = ?,
         hora_apertura = ?,
         hora_cierre = ?
     WHERE id_sucursal = ?`,
    [
      String(nombre).trim(),
      email ? String(email).trim() : null,
      telefono ? String(telefono).trim() : null,
      direccion ? String(direccion).trim() : null,
      ciudad ? String(ciudad).trim() : null,
      provincia ? String(provincia).trim() : null,
      hora_apertura || "08:00:00",
      hora_cierre || "23:00:00",
      idNum,
    ]
  );

  if (result.affectedRows === 0) {
    return badRequest(res, "Sucursal no encontrada");
  }

  return ok(res, { msg: "Sucursal actualizada correctamente" });
});


//ELIMINAR SUCURSAL (SOLO SUPERADMIN)
//ruta: DELETE /api/sucursales/:id
export const eliminarSucursal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (!idNum || Number.isNaN(idNum)) {
    return badRequest(res, "ID de sucursal inválido");
  }

  const [result] = await pool.query(
    `DELETE FROM sucursal WHERE id_sucursal = ?`,
    [idNum]
  );

  if (result.affectedRows === 0) {
    return badRequest(res, "Sucursal no encontrada");
  }

  return ok(res, { msg: "Sucursal eliminada correctamente" });
});


//MI SUCURSAL (SOLO ADMIN)
//ruta: GET /api/sucursales/mi
//Usa req.user.sucursal (id_sucursal del admin)
export const miSucursal = asyncHandler(async (req, res) => {
  const sucursalId = req.user?.sucursal;

  if (!sucursalId) {
    return badRequest(res, "El usuario no tiene una sucursal asociada");
  }

  const [rows] = await pool.query(
    `SELECT 
        id_sucursal,
        nombre,
        email,
        telefono,
        direccion,
        ciudad,
        provincia,
        hora_apertura,
        hora_cierre
     FROM sucursal
     WHERE id_sucursal = ?
     LIMIT 1`,
    [sucursalId]
  );

  if (!rows.length) {
    return badRequest(res, "Sucursal no encontrada");
  }

  return ok(res, rows[0]);
});
