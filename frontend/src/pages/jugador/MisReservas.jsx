import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/jugador.css";

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const cargarMisReservas = async () => {
    try {
      const res = await api.get("/reservas/mias");
      setReservas(res.data || []);
    } catch (err) {
      console.error("Error cargando reservas:", err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisReservas();
  }, []);

  return (
    <div className="jugador-container">
      <h1>Mis Reservas</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : reservas.length === 0 ? (
        <p>No tenés reservas realizadas.</p>
      ) : (
        <div className="lista-reservas-jugador">
          {reservas.map((r) => (
            <div className="reserva-card" key={r.id_reserva}>
              <h3>
                Cancha {r.cancha} — <span>{r.sucursal}</span>
              </h3>

              <p><b>Fecha:</b> {formatDate(r.inicio)}</p>
              <p><b>Horario:</b> {formatTime(r.inicio)} - {formatTime(r.fin)}</p>
              <p><b>Precio total:</b> ${r.precio_total}</p>
              <p><b>Seña:</b> ${r.senia}</p>

              <p className={`estado-${r.estado.toLowerCase()}`}>
                <b>Estado:</b> {r.estado}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
