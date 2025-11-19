import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import api from "../../api";

export default function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const estados = ["PENDIENTE", "VERIFICADO", "RECHAZADO"];

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const asArray = (res) => {
    if (!res || !res.data) return [];
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    for (const v of Object.values(d)) {
      if (Array.isArray(v)) return v;
    }
    return [];
  };

  const loadPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pagos/sucursal", {
        params: {
          estado: filtroEstado || undefined,
          fecha: filtroFecha || undefined,
        },
      });
      const lista = asArray(res);
      setPagos(lista);
    } catch (err) {
      console.error("Error cargando pagos de sucursal:", err?.response?.data || err);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPagos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroFecha]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Pagos de Mi Sucursal</h1>
          <p className="dashboard-subtitle">
            Gestioná los pagos realizados por los jugadores de tu sucursal.
          </p>
        </header>

        {/* FILTROS */}
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
            >
              <option value="">Todos los estados</option>
              {estados.map((e) => (
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
            />
          </div>
        </section>

        {/* LISTADO */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Listado de Pagos</h2>

          {loading ? (
            <p>Cargando pagos...</p>
          ) : pagos.length === 0 ? (
            <p>No hay pagos en esta sucursal.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Jugador</th>
                  <th>Cancha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td>
                    <td>{formatDate(p.fecha)}</td>
                    <td>{p.jugador || "-"}</td>
                    <td>{p.cancha || "-"}</td>
                    <td>${p.monto?.toFixed ? p.monto.toFixed(2) : p.monto}</td>
                    <td>{p.metodo || "-"}</td>
                    <td>{p.estado}</td>
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
