import { useEffect, useState } from "react";
import api from "../../api";

export default function SuperAdminSucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/sucursales/admin");
        setSucursales(res.data?.data || res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.msg || "Error al cargar sucursales";
        setError(msg);
      }
    };
    load();
  }, []);

  return (
    <div className="page-container">
      <h1>Gestión de sucursales</h1>
      {error && <p className="error-text">{error}</p>}

      {sucursales.length === 0 ? (
        <p>No hay sucursales registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Provincia</th>
              <th>Apertura</th>
              <th>Cierre</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.map((s) => (
              <tr key={s.id_sucursal}>
                <td>{s.id_sucursal}</td>
                <td>{s.nombre}</td>
                <td>{s.ciudad}</td>
                <td>{s.provincia}</td>
                <td>{s.hora_apertura}</td>
                <td>{s.hora_cierre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
