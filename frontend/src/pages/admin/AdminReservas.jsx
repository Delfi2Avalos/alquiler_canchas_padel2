import { useEffect, useState } from "react";
import api from "../../api"; //axios configurado con token
import "../../styles/Dashboard.css";

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const estadosFiltro = ["PENDIENTE", "CONFIRMADA", "RECHAZADA"];

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const asArray = (res, preferredKey) => {
    if (!res || !res.data) return [];
    const d = res.data;

    if (Array.isArray(d)) return d;
    if (preferredKey && Array.isArray(d[preferredKey])) return d[preferredKey];
    if (Array.isArray(d.data)) return d.data;

    for (const v of Object.values(d)) {
      if (Array.isArray(v)) return v;
    }
    return [];
  };

  //CARGAR RESERVAS (MI SUCURSAL)
  const loadReservas = async () => {
    try {
      setLoading(true);

      const res = await api.get("/reservas/sucursal", {
        params: {
          estado: filtroEstado || undefined,
          fecha: filtroFecha || undefined,
        },
      });

      const lista = asArray(res, "reservas");
      setReservas(lista);
      console.log("Reservas de mi sucursal:", lista);
    } catch (err) {
      console.error("Error cargando reservas:", err?.response?.data || err);
      setReservas([]);
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

  //ACCIONES DEL ADMIN
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await api.patch(`/reservas/${id}/estado`, {
        estado: nuevoEstado,
      });

      alert(res.data.msg || "Estado actualizado");
      loadReservas();
    } catch (err) {
      console.error("Error cambiando estado:", err?.response?.data || err);
      alert("Error cambiando estado");
    }
  };

  const confirmarReserva = async (id) => {
    if (!window.confirm("¿Confirmar esta reserva?")) return;
    await cambiarEstado(id, "CONFIRMADA");
  };

  const rechazarReserva = async (id) => {
    if (!window.confirm("¿Rechazar esta reserva?")) return;
    await cambiarEstado(id, "RECHAZADA");
  };

  const modificarReserva = (reserva) => {
    alert(
      `Funcionalidad de modificar reserva #${reserva.id_reserva} (solo PENDIENTE) - pendiente de implementación`
    );
  };

  //UI
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
              {estadosFiltro.map((e) => (
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
                  <th>Acciones</th>
                  <th>Precio</th>
                  <th>Seña</th>
                </tr>
              </thead>

              <tbody>
                {reservas.map((r) => {
                  const esPendiente = r.estado === "PENDIENTE";

                  return (
                    <tr key={r.id_reserva}>
                      <td>{r.id_reserva}</td>
                      <td>{r.usuario || "-"}</td>
                      <td>{r.cancha || "-"}</td>
                      <td>{formatDate(r.inicio)}</td>
                      <td>
                        {formatTime(r.inicio)} - {formatTime(r.fin)}
                      </td>

                      <td>{r.estado}</td>

                      <td>
                        {esPendiente ? (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              className="dashboard-card-button"
                              style={{ padding: "4px 8px" }}
                              onClick={() => confirmarReserva(r.id_reserva)}
                            >
                              Confirmar
                            </button>

                            <button
                              className="dashboard-btn-delete"
                              style={{ padding: "4px 8px" }}
                              onClick={() => rechazarReserva(r.id_reserva)}
                            >
                              Rechazar
                            </button>

                            <button
                              className="dashboard-btn-edit"
                              style={{ padding: "4px 8px" }}
                              onClick={() => modificarReserva(r)}
                            >
                              Modificar
                            </button>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>${r.precio_total}</td>
                      <td>${r.senia}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
