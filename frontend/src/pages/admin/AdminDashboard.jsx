import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();          // limpia usuario + token
    navigate("/login"); // te lleva al login
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header" style={{ position: "relative" }}>
          <h1 className="dashboard-title">Panel Administrador</h1>
          <p className="dashboard-subtitle">
            Gestioná las canchas, reservas y pagos de tu sucursal.
          </p>

          <button
            onClick={handleLogout}
            style={{
              position: "absolute",
              right: "0",
              top: "0",
              padding: "8px 14px",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Cerrar sesión
          </button>
        </header>

        <section className="dashboard-section">
          <div className="dashboard-cards">
            {/* Reservas */}
            <article className="dashboard-card">
              <h2 className="dashboard-card-title">Reservas</h2>
              <p className="dashboard-card-text">
                Revisá y actualizá el estado de las reservas de tu sucursal.
              </p>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/admin/reservas")}
              >
                Ver reservas
              </button>
            </article>

            {/* Canchas */}
            <article className="dashboard-card">
              <h2 className="dashboard-card-title">Canchas</h2>
              <p className="dashboard-card-text">
                Activá, desactivá o editá las canchas de tu sucursal.
              </p>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/admin/canchas")}
              >
                Gestionar canchas
              </button>
            </article>

            {/* Pagos */}
            <article className="dashboard-card">
              <h2 className="dashboard-card-title">Pagos</h2>
              <p className="dashboard-card-text">
                Verificá comprobantes y actualizá el estado de los pagos.
              </p>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/admin/pagos")}
              >
                Ver pagos
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
