import api from "../api/api";

export const getCanchas = async (id_sucursal = null) => {
  const url = id_sucursal ? `/sucursales/${id_sucursal}/canchas` : `/canchas`;
  const res = await api.get(url);
  return res.data;
};

export const getCancha = async (id) => {
  const res = await api.get(`/canchas/${id}`);
  return res.data;
};
