import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

//ruta: GET /api/superadmin/stats
//Devuelve estadísticas reales del sistema
router.get("/stats", async (req, res) => {
  try {
    // Total de sucursales
    const [sucursales] = await pool.query(
      "SELECT COUNT(*) AS total FROM sucursal"
    );

    // Total de admins activos
    const [admins] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuario WHERE rol = 'ADMIN' AND activo = 1"
    );

    // Reservas creadas HOY
    const [reservasHoy] = await pool.query(
      "SELECT COUNT(*) AS total FROM reserva WHERE DATE(inicio) = CURDATE()"
    );

    // Ocupación general 
    const [totalCanchas] = await pool.query(
      "SELECT COUNT(*) AS total FROM cancha WHERE estado = 'ACTIVA'"
    );

    const [reservasActivas] = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM reserva 
       WHERE estado IN ('RESERVADA','CONFIRMADA','EN_CURSO')
         AND DATE(inicio) = CURDATE()`
    );

    const ocupacion =
      totalCanchas[0].total > 0
        ? Math.round((reservasActivas[0].total / totalCanchas[0].total) * 100)
        : 0;

    res.json({
      ok: true,
      sucursalesActivas: sucursales[0].total,
      adminsActivos: admins[0].total,
      reservasHoy: reservasHoy[0].total,
      ocupacion,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del superadmin:", error);
    res.status(500).json({ ok: false, msg: "Error obteniendo estadísticas" });
  }
});

export default router;
