import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";

const r = Router();

// registro y login
r.post("/register", register);
r.post("/login", login);

export default r;
