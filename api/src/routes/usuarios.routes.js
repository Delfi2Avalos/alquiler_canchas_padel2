import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getPerfil, actualizarPerfil } from "../controllers/usuarios.controller.js";

const router = Router();

// Obtener datos del usuario logueado
router.get("/perfil", requireAuth(), getPerfil);

// Actualizar perfil
router.put("/perfil", requireAuth(), actualizarPerfil);

export default router;
