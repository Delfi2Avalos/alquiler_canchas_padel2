import api from "../api";

export const crearPago = async (id_reserva, comprobante_url, comprobante_mime) => {
  const res = await api.post(`/pagos`, { id_reserva, comprobante_url, comprobante_mime });
  return res.data;
};

export const getPagos = async (params = {}) => {
  const res = await api.get("/pagos", { params });
  return res.data;
};
