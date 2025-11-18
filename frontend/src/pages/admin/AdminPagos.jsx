import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function AdminPagos() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: "",
    fecha: "",
  });

  // Modal de comprobante
  const [selectedPago, setSelectedPago] = useState(null);

  // Modal de cambio de estado
  const [editPago, setEditPago] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // ========================
  //   CARGAR PAGOS
  // ========================
  const loadPagos = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.fecha) params.append("fecha", filtros.fecha);

    const res = await fetch(
      `${baseUrl}/api/pagos/sucursal?${params.toString()}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (data.ok) setPagos(data.data || data);
    setLoading(false);
  };

  useEffect(() => {
    loadPagos();
  }, []);

  // Al cambiar filtros:
  useEffect(() => {
    loadPagos();
  }, [filtros]);

  // ========================
  //   CAMBIAR ESTADO
  // ========================
  const cambiarEstado = async (e) => {
    e.preventDefault();

    const res = await fetch(`${baseUrl}/api/pagos/${editPago.id_pago}/estado`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    const data = await res.json();

    alert(data.msg || "Estado actualizado");

    setEditPago(null);
    setNuevoEstado("");
    loadPagos();
  };

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
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {/* Estado */}
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

        {/* TABLA DE PAGOS */}
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
                  <th>ID Pago</th>
                  <th>Usuario</th>
                  <th>Cancha</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td>
                    <td>{p.usuario}</td>
                    <td>{p.cancha}</td>
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

                    <td>
                      <button
                        className="dashboard-btn-edit"
                        onClick={() => {
                          setEditPago(p);
                          setNuevoEstado(p.estado);
                        }}
                      >
                        🔁 Estado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* MODAL COMPROBANTE */}
      {selectedPago && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Comprobante</h2>

            <img
              src={selectedPago.comprobante_url}
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

      {/* MODAL CAMBIAR ESTADO */}
      {editPago && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Cambiar Estado del Pago</h2>

            <form className="modal-form" onSubmit={cambiarEstado}>
              <label>Nuevo estado:</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                required
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="VERIFICADO">Verificado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="dashboard-card-button">
                  Guardar cambios
                </button>

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setEditPago(null);
                    setNuevoEstado("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
