import api from "../api/api";

export const getUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data;
};

export const getUsuarioById = async (id) => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
};

export const updateUsuario = async (id, payload) => {
  const res = await api.put(`/usuarios/${id}`, payload);
  return res.data;
};

export const createUsuario = async (payload) => {
  const res = await api.post("/usuarios", payload);
  return res.data;
};
