import api from "../api";

export const getCanchas = async (id_sucursal) => {
  const res = await api.get(`/canchas/sucursal/${id_sucursal}`);

  // Backend devuelve { ok:true, data:[ ... ] }
  return Array.isArray(res.data.data) ? res.data.data : [];
};

export const getCancha = async (id) => {
  const res = await api.get(`/canchas/${id}`);
  return res.data?.data || null;
};
