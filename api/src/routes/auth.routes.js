import express from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();


//LOGIN
//ruta: POST /api/auth/login
router.post("/login", login);


//REGISTRO (jugador)
//ruta: POST /api/auth/register
router.post("/register", register);


//PERFIL DEL USUARIO LOGUEADO
//ruta: GET /api/auth/me
//Requiere token
router.get("/me", requireAuth(), me);

export default router;
