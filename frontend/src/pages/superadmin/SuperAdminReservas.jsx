import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import api from "../../api";

export default function SuperAdminReservas() {
  const [sucursales, setSucursales] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    sucursalId: "",
    estado: "",
    fecha: "",
  });

  const formatearFecha = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  };

  const formatearHorario = (inicio, fin) => {
    if (!inicio || !fin) return "-";
    const h1 = inicio.slice(11, 16);
    const h2 = fin.slice(11, 16);
    return `${h1} - ${h2}`;
  };

  //CARGAR SUCURSALES
  const loadSucursales = async () => {
    try {
      const res = await api.get("/sucursales/admin");
      const data = res.data?.data || res.data || [];
      setSucursales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando sucursales:", err);
      setSucursales([]);
    }
  };

  //CARGAR RESERVAS
  const loadReservas = async () => {
    try {
      setLoading(true);

      const params = {};
      if (filtros.sucursalId) params.sucursalId = filtros.sucursalId;
      if (filtros.estado) params.estado = filtros.estado; 
      if (filtros.fecha) params.fecha = filtros.fecha; 

      const res = await api.get("/reservas/admin", { params });

      const data = res.data?.data || res.data || [];
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando reservas globales:", err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
    loadReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada vez que cambian los filtros, recargamos
  useEffect(() => {
    loadReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Reservas globales</h1>
          <p className="dashboard-subtitle">
            Consultá todas las reservas del sistema, por sucursal y fecha.
          </p>
        </header>

        {/* FILTROS */}
        <section className="dashboard-section" style={{ marginBottom: 20 }}>
          <h2 className="dashboard-section-title">Filtros</h2>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {/* Sucursal */}
            <select
              value={filtros.sucursalId}
              onChange={(e) =>
                setFiltros({ ...filtros, sucursalId: e.target.value })
              }
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* Estado (solo los 3 nuevos) */}
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>

            {/* Fecha */}
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha: e.target.value })
              }
            />
          </div>
        </section>

        {/* LISTADO */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Listado de reservas</h2>

          {loading ? (
            <p>Cargando reservas...</p>
          ) : reservas.length === 0 ? (
            <p>No hay reservas para los filtros seleccionados.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sucursal</th>
                  <th>Cancha</th>
                  <th>Jugador</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Precio total</th>
                  <th>Seña</th>
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
                    <td>{formatearFecha(r.inicio)}</td>
                    <td>{formatearHorario(r.inicio, r.fin)}</td>
                    <td>${r.precio_total}</td>
                    <td>${r.senia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
