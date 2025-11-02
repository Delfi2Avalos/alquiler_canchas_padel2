export const ok = (res, data) => res.status(200).json({ ok: true, data });
export const created = (res, data) => res.status(201).json({ ok: true, data });
export const badRequest = (res, msg) => res.status(400).json({ ok: false, msg });
export const unauthorized = (res, msg) => res.status(401).json({ ok: false, msg });
export const forbidden = (res, msg) => res.status(403).json({ ok: false, msg });
export const conflict = (res, msg) => res.status(409).json({ ok: false, msg });
export const serverError = (res, err) =>
  res.status(500).json({ ok: false, msg: "Error interno", err: String(err) });
