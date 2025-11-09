export const ok         = (res, data)        => res.status(200).json({ ok: true,  data });
export const created    = (res, data)        => res.status(201).json({ ok: true,  data });
export const badRequest = (res, msg)         => res.status(400).json({ ok: false, msg });
export const unauthorized = (res, msg='No autorizado') => res.status(401).json({ ok: false, msg });
export const forbidden  = (res, msg='Permisos insuficientes') => res.status(403).json({ ok: false, msg });
export const conflict   = (res, msg)         => res.status(409).json({ ok: false, msg });
export const notFound   = (res, msg='No encontrado') => res.status(404).json({ ok: false, msg });

export const serverError = (res, err) => {
  const dev = process.env.NODE_ENV !== 'production';
  return res.status(500).json({
    ok: false,
    msg: "Error interno",
    ...(dev ? { err: String(err) } : {})
  });
};

// helper para controladores async
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
