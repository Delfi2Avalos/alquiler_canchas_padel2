import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Panel Administrador</h1>
          <p className="dashboard-subtitle">
            Gestioná las canchas, reservas y pagos de tu sucursal.
          </p>
        </header>

        <section className="dashboard-grid">
          {/* Reservas de la sucursal */}
          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">📅</div>
              <h2 className="dashboard-card-title">Reservas</h2>
            </div>
            <p className="dashboard-card-text">
              Revisá y actualizá el estado de las reservas de tu sucursal.
            </p>
            <div className="dashboard-card-info">
              <span className="dashboard-card-number">-</span>
              <span className="dashboard-card-label">
                reservas (ver detalle en la sección)
              </span>
            </div>
            <button
              className="dashboard-card-button"
              onClick={() => navigate("/admin/reservas")}
            >
              Ver reservas
            </button>
          </article>

          {/* Canchas de la sucursal */}
          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">🏟️</div>
              <h2 className="dashboard-card-title">Canchas</h2>
            </div>
            <p className="dashboard-card-text">
              Activá, desactivá o editá las canchas de tu sucursal.
            </p>
            <div className="dashboard-card-info">
              <span className="dashboard-card-number">-</span>
              <span className="dashboard-card-label">
                canchas (gestión detallada en la sección)
              </span>
            </div>
            <button
              className="dashboard-card-button"
              onClick={() => navigate("/admin/canchas")}
            >
              Gestionar canchas
            </button>
          </article>

          {/* Pagos de la sucursal */}
          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">💳</div>
              <h2 className="dashboard-card-title">Pagos</h2>
            </div>
            <p className="dashboard-card-text">
              Verificá comprobantes y actualizá el estado de los pagos.
            </p>
            <div className="dashboard-card-info">
              <span className="dashboard-card-number">-</span>
              <span className="dashboard-card-label">
                pagos (gestión desde la sección)
              </span>
            </div>
            <button
              className="dashboard-card-button"
              onClick={() => navigate("/admin/pagos")}
            >
              Ver pagos
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
