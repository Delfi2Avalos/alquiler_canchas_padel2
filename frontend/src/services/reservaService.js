import api from "../api";

//RESERVAS DEL JUGADOR

const extractDataArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  if (res && Array.isArray(res.data?.data)) return res.data.data;
  return []; // fallback seguro
};

//Lista reservas del usuario logueado
export const getMisReservas = async () => {
  const res = await api.get("/reservas/mias");
  return extractDataArray(res.data);
};

//Alias para el componente Reservas.jsx
export const getReservas = getMisReservas;

//Crear reserva (estado PENDIENTE)
export const crearReserva = async (payload) => {
  const res = await api.post("/reservas", payload);
  return res.data;
};

//Obtener horarios LIBRE/OCUPADO
export const getHorariosDisponibles = async (canchaId, fecha) => {
  const res = await api.get("/reservas/horarios", {
    params: { canchaId, fecha },
  });
  return extractDataArray(res.data);
};

//Disponibilidad bruta
export const getDisponibilidad = async (canchaId, fecha) => {
  const res = await api.get("/reservas/disponibilidad", {
    params: { canchaId, fecha },
  });
  return extractDataArray(res.data);
};

//Cancelar reserva
export const cancelarReserva = async (id_reserva) => {
  const res = await api.delete(`/reservas/${id_reserva}`);
  return res.data;
};


//RESERVAS DEL ADMIN
//ADMIN: ver reservas de su sucursal
export const getReservasSucursal = async (params = {}) => {
  const res = await api.get("/reservas/sucursal", { params });
  return extractDataArray(res.data);
};

//ADMIN: cambiar estado (CONFIRMADA/RECHAZADA)
export const cambiarEstadoReserva = async (id_reserva, estado) => {
  const res = await api.patch(`/reservas/${id_reserva}/estado`, { estado });
  return res.data;
};

//SUPERADMIN  
//Ver reservas globales (todas las sucursales)
export const getReservasGlobal = async (params = {}) => {
  const res = await api.get("/reservas/admin", { params });
  return extractDataArray(res.data);
};
