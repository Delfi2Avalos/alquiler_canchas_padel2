import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function SuperAdminPagos() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [pagos, setPagos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtros, setFiltros] = useState({
    sucursalId: "",
    estado: "",
    fecha: "",
  });

  // Modal comprobante
  const [selectedPago, setSelectedPago] = useState(null);

  // ========================
  //   CARGAR SUCURSALES
  // ========================
  const loadSucursales = async () => {
    const res = await fetch(`${baseUrl}/api/sucursales/admin`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data) setSucursales(data);
  };

  // ========================
  //   CARGAR PAGOS
  // ========================
  const loadPagos = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append("sucursalId", filtros.sucursalId);
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.fecha) params.append("fecha", filtros.fecha);

    const res = await fetch(`${baseUrl}/api/pagos/admin?${params.toString()}`, {
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok) setPagos(data.data || data);
    setLoading(false);
  };

  useEffect(() => {
    loadSucursales();
    loadPagos();
  }, []);

  // Cuando cambian los filtros
  useEffect(() => {
    loadPagos();
  }, [filtros]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay"></div>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Pagos del Sistema</h1>
          <p className="dashboard-subtitle">
            El Superadmin puede ver todos los pagos realizados.
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
            {/* Filtro sucursal */}
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

            {/* Filtro estado */}
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="VERIFICADO">Verificado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>

            {/* Filtro fecha */}
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha: e.target.value })
              }
            />
          </div>
        </section>

        {/* TABLA DE PAGOS */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Listado de Pagos</h2>

          {loading ? (
            <p>Cargando pagos...</p>
          ) : pagos.length === 0 ? (
            <p>No hay pagos registrados con los filtros seleccionados.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID Pago</th>
                  <th>Sucursal</th>
                  <th>Cancha</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                </tr>
              </thead>

              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td>
                    <td>{p.sucursal}</td>
                    <td>{p.cancha}</td>
                    <td>{p.usuario}</td>
                    <td>${p.monto}</td>
                    <td>{p.estado}</td>
                    <td>{p.comprobante_subido_en?.slice(0, 10)}</td>
                    <td>
                      <button
                        className="dashboard-btn-edit"
                        onClick={() => setSelectedPago(p)}
                      >
                        📄 Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* MODAL VER COMPROBANTE */}
      {selectedPago && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Comprobante de Pago</h2>

            <img
              src={selectedPago.comprobante_url}
              alt="Comprobante"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "15px",
              }}
            />

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setSelectedPago(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
