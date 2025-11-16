import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminCanchas() {
  const [canchas, setCanchas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/canchas/mi");
        setCanchas(res.data?.data || res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.msg || "Error al cargar canchas";
        setError(msg);
      }
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <h1>Canchas de mi sucursal</h1>
      {error && <p className="error-text">{error}</p>}

      {canchas.length === 0 ? (
        <p>No hay canchas registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Techada</th>
              <th>Iluminación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {canchas.map((c) => (
              <tr key={c.id_cancha}>
                <td>{c.id_cancha}</td>
                <td>{c.nombre}</td>
                <td>{c.cubierta ? "Sí" : "No"}</td>
                <td>{c.iluminacion ? "Sí" : "No"}</td>
                <td>{c.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
