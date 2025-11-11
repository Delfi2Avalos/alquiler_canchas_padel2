import React, { useEffect, useState } from "react";
import { getReservas, crearReserva, cancelarReserva } from "../services/reservaService";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      const data = await getReservas();
      setReservas(data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancelar = async (id) => {
    try {
      await cancelarReserva(id);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="container">
      <h2>Mis Reservas</h2>
      {err && <p style={{color:'red'}}>{err}</p>}
      <table className="table">
        <thead><tr><th>Cancha</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r.id_reserva}>
              <td>{r.id_cancha}</td>
              <td>{new Date(r.inicio).toLocaleString()}</td>
              <td>{new Date(r.fin).toLocaleString()}</td>
              <td>{r.estado}</td>
              <td>
                {r.estado !== "CANCELADA" && (
                  <button onClick={() => handleCancelar(r.id_reserva)}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
