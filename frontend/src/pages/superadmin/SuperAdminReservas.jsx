import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

export default function SuperAdminReservas() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [reservas, setReservas] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroSucursal, setFiltroSucursal] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // =============================
  //   CARGAR SUCURSALES
  // =============================
  const loadSucursales = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/sucursales`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSucursales(data);
      }
    } catch (err) {
      console.error("Error cargando sucursales:", err);
    }
  };

  // =============================
  //   CARGAR RESERVAS
  // =============================
  const loadReservas = async () => {
    try {
      const params = new URLSearchParams();

      if (filtroSucursal) params.append("sucursalId", filtroSucursal);
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroFecha) params.append("fecha", filtroFecha);

      const res = await fetch(
        `${baseUrl}/api/reservas/admin?${params.toString()}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.ok !== false) {
        setReservas(data);
      }
    } catch (err) {
      console.error("Error cargando reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
    loadReservas();
  }, []);

  // Volver a cargar cada vez que cambian los filtros
  useEffect(() => {
    loadReservas();
  }, [filtroSucursal, filtroEstado, filtroFecha]);

  // =============================
  //   FORMATEAR FECHA Y HORA
  // =============================
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

        {/* ============================= */}
        {/*          FILTROS             */}
        {/* ============================= */}
        <section className="dashboard-section" style={{ marginBottom: 20 }}>
          <h2 className="dashboard-section-title">Filtros</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {/* Sucursal */}
            <select
              value={filtroSucursal}
              onChange={(e) => setFiltroSucursal(e.target.value)}
              className="modal-form select"
              style={{
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                minWidth: "180px",
              }}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal}>
                  {s.nombre}
                </option>
              ))}
            </select>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                minWidth: "180px",
              }}
            >
              <option value="">Todos los estados</option>
              <option value="RESERVADA">Reservada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EN_CURSO">En curso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NO_SHOW">No Show</option>
            </select>

            {/* Fecha */}
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </section>

        {/* ============================= */}
        {/*       TABLA PRINCIPAL         */}
        {/* ============================= */}

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
                  <th>Jugador</th>
                  <th>Sucursal</th>
                  <th>Cancha</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Seña</th>
                </tr>
              </thead>

              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>{r.id_reserva}</td>
                    <td>{r.usuario}</td>
                    <td>{r.sucursal}</td>
                    <td>{r.cancha}</td>
                    <td>{formatDate(r.inicio)}</td>
                    <td>
                      {formatTime(r.inicio)} - {formatTime(r.fin)}
                    </td>
                    <td>{r.estado}</td>
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
