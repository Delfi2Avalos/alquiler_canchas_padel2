import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/reservas/sucursal");
        // según el helper http, puede venir como { ok, data } o directamente array
        setReservas(res.data?.data || res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.msg || "Error al cargar reservas";
        setError(msg);
      }
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <h1>Reservas de mi sucursal</h1>
      {error && <p className="error-text">{error}</p>}

      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cancha</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Seña</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.id_reserva}</td>
                <td>{r.cancha}</td>
                <td>{r.usuario}</td>
                <td>{r.estado}</td>
                <td>{r.inicio}</td>
                <td>{r.fin}</td>
                <td>{r.senia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
