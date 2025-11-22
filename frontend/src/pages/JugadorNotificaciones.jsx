import React, { useEffect, useState } from "react";
import { obtenerMisNotificaciones } from "../services/notificacionesService";
import "../styles/notificaciones.css";

export default function JugadorNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="notif-container">
      <h1>Mis notificaciones</h1>

      {loading && <p>Cargando...</p>}

      {!loading && notificaciones.length === 0 && (
        <p className="notif-empty">No tenés notificaciones</p>
      )}

      {!loading &&
        notificaciones.map((n) => (
          <div key={n.id_notificacion} className="notif-item">
            <p>{n.mensaje}</p>
            <span>{new Date(n.creada_en).toLocaleString("es-AR")}</span>
          </div>
        ))}
    </div>
  );
}
