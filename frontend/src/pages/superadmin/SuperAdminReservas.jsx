import { useEffect, useState } from "react";
import api from "../../api";

export default function SuperAdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/reservas/admin");
        setReservas(res.data?.data || res.data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.msg || "Error al cargar reservas globales";
        setError(msg);
      }
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <h1>Reservas de todas las sucursales</h1>
      {error && <p className="error-text">{error}</p>}

      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sucursal</th>
              <th>Cancha</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.id_reserva}</td>
                <td>{r.sucursal}</td>
                <td>{r.cancha}</td>
                <td>{r.usuario}</td>
                <td>{r.estado}</td>
                <td>{r.inicio}</td>
                <td>{r.fin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
