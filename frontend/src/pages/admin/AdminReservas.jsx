import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function AdminReservas() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // ============================
  //   CARGAR RESERVAS
  // ============================
  const loadReservas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroFecha) params.append("fecha", filtroFecha);

      const res = await fetch(
        `${baseUrl}/api/reservas/sucursal?${params.toString()}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.ok !== false) setReservas(data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, []);

  useEffect(() => {
    loadReservas();
  }, [filtroEstado, filtroFecha]);

  // ============================
  //   CAMBIAR ESTADO
  // ============================
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${baseUrl}/api/reservas/${id}/estado`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();
      alert(data.msg || "Estado actualizado");

      if (data.ok !== false) loadReservas();
    } catch (err) {
      console.error("Error cambiando estado:", err);
    }
  };

  // ============================
  //   FORMATOS
  // ============================
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

  const estadosPermitidos = [
    "RESERVADA",
    "CONFIRMADA",
    "EN_CURSO",
    "COMPLETADA",
    "CANCELADA",
    "NO_SHOW",
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Reservas de mi sucursal</h1>
          <p className="dashboard-subtitle">
            Administrá y controlá las reservas de las canchas de tu sucursal.
          </p>
        </header>

        {/* ========== FILTROS ========== */}
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
              {estadosPermitidos.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
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

        {/* ========== TABLA PRINCIPAL ========== */}
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
                  <th>Cancha</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Cambiar</th>
                  <th>Precio</th>
                  <th>Seña</th>
                </tr>
              </thead>

              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>{r.id_reserva}</td>
                    <td>{r.usuario}</td>
                    <td>{r.cancha}</td>
                    <td>{formatDate(r.inicio)}</td>
                    <td>
                      {formatTime(r.inicio)} - {formatTime(r.fin)}
                    </td>

                    <td>{r.estado}</td>

                    {/* CAMBIAR ESTADO */}
                    <td>
                      <select
                        value={r.estado}
                        onChange={(e) =>
                          cambiarEstado(r.id_reserva, e.target.value)
                        }
                        style={{
                          padding: "5px 8px",
                          borderRadius: "8px",
                          border: "1px solid #bbb",
                        }}
                      >
                        {estadosPermitidos.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </td>

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
