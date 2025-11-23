import React, { useEffect, useState } from "react";
import { getReservas } from "../services/reservaService"; 
import "../styles/App.css";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const loadReservas = async () => {
    try {
      const data = await getReservas();
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Error al cargar las reservas";

      setError(msg);
      setReservas([]);
    }
  };

  useEffect(() => {
    loadReservas();
  }, []);

  return (
    <div className="page-container">
      <h1 className="main-title">Mis Reservas</h1>

      {error && <p className="error-text">{error}</p>}

      {!Array.isArray(reservas) || reservas.length === 0 ? (
        <p>No tenés reservas activas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Sucursal</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              {/* Eliminado: <th>Acciones</th> */}
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.cancha || r.id_cancha}</td>
                <td>{r.sucursal || "-"}</td>
                <td>{new Date(r.inicio).toLocaleString()}</td>
                <td>{new Date(r.fin).toLocaleString()}</td>
                <td>{r.estado}</td>
                {/* Eliminada la celda de acciones y el botón Cancelar */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="start-btn"
        onClick={() => (window.location.href = "/home")}
      >
        Volver al Menú
      </button>
    </div>
  );
}
