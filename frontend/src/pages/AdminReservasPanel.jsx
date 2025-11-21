import { useEffect, useState } from "react";
import {
  getReservasSucursal,
  cambiarEstadoReserva
} from "../services/reservaService";
import "../styles/App.css"; 

export default function AdminReservasPanel() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [filtroFecha, setFiltroFecha] = useState("");

  // Estados permitidos en tu BD
  const estadosFiltro = ["PENDIENTE", "CONFIRMADA", "RECHAZADA"];

  const cargar = async () => {
    try {
      setLoading(true);

      const res = await getReservasSucursal({
        estado: filtroEstado || undefined,
        fecha: filtroFecha || undefined,
      });

      setReservas(res);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    cargar();
  }, [filtroEstado, filtroFecha]);

  const confirmar = async (id) => {
    if (!window.confirm("¿Confirmar esta reserva?")) return;
    await cambiarEstadoReserva(id, "CONFIRMADA");
    cargar();
  };

  const rechazar = async (id) => {
    if (!window.confirm("¿Rechazar esta reserva?")) return;
    await cambiarEstadoReserva(id, "RECHAZADA");
    cargar();
  };

  const formatearFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatearHora = (iso) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="admin-container">
      <h1>Panel de Reservas</h1>
      <p>Gestioná las reservas realizadas por jugadores en tu sucursal.</p>

      {/* FILTROS */}
      <div className="filtros">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          {estadosFiltro.map((e) => (
            <option value={e} key={e}>
              {e}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : reservas.length === 0 ? (
        <p>No hay reservas para los filtros seleccionados.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Jugador</th>
              <th>Cancha</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Seña</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.id_reserva}</td>
                <td>{r.usuario}</td>
                <td>{r.cancha}</td>
                <td>{formatearFecha(r.inicio)}</td>
                <td>
                  {formatearHora(r.inicio)} - {formatearHora(r.fin)}
                </td>
                <td className={`estado-${r.estado.toLowerCase()}`}>
                  {r.estado}
                </td>
                <td>${r.precio_total}</td>
                <td>${r.senia}</td>

                <td>
                  {r.estado === "PENDIENTE" ? (
                    <>
                      <button
                        className="btn-confirmar"
                        onClick={() => confirmar(r.id_reserva)}
                      >
                        Confirmar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => rechazar(r.id_reserva)}
                      >
                        Rechazar
                      </button>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
