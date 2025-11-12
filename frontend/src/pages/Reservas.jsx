import React, { useEffect, useState } from "react";
import { getReservas, cancelarReserva } from "../services/reservaService";
import "../styles/App.css";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const loadReservas = async () => {
    try {
      const data = await getReservas();
      setReservas(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar las reservas");
    }
  };

  useEffect(() => {
    loadReservas();
  }, []);

  const handleCancelar = async (id) => {
    try {
      await cancelarReserva(id);
      loadReservas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al cancelar la reserva");
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Mis Reservas</h1>
      {error && <p className="error-text">{error}</p>}

      {reservas.length === 0 ? (
        <p>No tenés reservas activas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.id_cancha}</td>
                <td>{new Date(r.inicio).toLocaleString()}</td>
                <td>{new Date(r.fin).toLocaleString()}</td>
                <td>{r.estado}</td>
                <td>
                  {r.estado !== "CANCELADA" && (
                    <button
                      className="menu-btn logout"
                      onClick={() => handleCancelar(r.id_reserva)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
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
