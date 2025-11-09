import { Router } from "express";

const r = Router();

// GET /health/
r.get("/", (_req, res) => res.json({ ok: true, service: "api-padel" }));

export default r;
