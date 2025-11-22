import api from "../api";

export async function obtenerMisNotificaciones() {
  try {
    const res = await api.get("/notificaciones/mias");
    return res.data.data || [];
  } catch (err) {
    console.error("Error en obtenerMisNotificaciones:", err);
    throw err;
  }
}
