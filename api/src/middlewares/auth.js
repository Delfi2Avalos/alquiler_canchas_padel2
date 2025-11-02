import jwt from "jsonwebtoken";

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

export const requireAuth = (roles = []) => (req, res, next) => {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, msg: "Token requerido" });

    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length && !roles.includes(data.role)) {
      return res.status(403).json({ ok: false, msg: "Permisos insuficientes" });
    }
    req.user = data;
    next();
  } catch {
    return res.status(401).json({ ok: false, msg: "Token inválido" });
  }
};
