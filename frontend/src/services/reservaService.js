import api from "../api";

export const getReservas = async (params = {}) => {
  // params ejemplo: { fecha: '2025-11-10', id_usuario: 3 }
  const res = await api.get("/reservas", { params });
  return res.data;
};

export const crearReserva = async (reservaPayload) => {
  // reservaPayload: { id_sucursal, id_cancha, id_usuario, inicio, fin, precio_total }
  const res = await api.post("/reservas", reservaPayload);
  return res.data;
};

export const actualizarReserva = async (id, payload) => {
  const res = await api.put(`/reservas/${id}`, payload);
  return res.data;
};

export const cancelarReserva = async (id) => {
  const res = await api.delete(`/reservas/${id}`);
  return res.data;
};
