import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[WARN] No hay JWT_SECRET definido en .env. Genera uno seguro para producción."
  );
}

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });


export const requireAuth =
  (roles = []) =>
  (req, res, next) => {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) {
      return res.status(401).json({ ok: false, msg: "Token requerido" });
    }

    try {
      const data = jwt.verify(token, process.env.JWT_SECRET, {
        clockTolerance: 10,
      });

      if (roles.length && !roles.includes(data.role)) {
        return res
          .status(403)
          .json({ ok: false, msg: "Permisos insuficientes" });
      }

      req.user = data;
      next();
    } catch (e) {
      return res.status(401).json({ ok: false, msg: "Token inválido" });
    }
  };
