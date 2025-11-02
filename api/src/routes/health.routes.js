import { Router } from "express";
const r = Router();

r.get("/health", (_req, res) => res.json({ ok: true, service: "api-padel" }));

export default r;
