import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

r.post("/register", register);
r.post("/login", login);
r.get("/me", requireAuth(), me); // devuelve perfil del usuario autenticado

export default r;
