import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    sucursalesActivas: 0,
    adminsActivos: 0,
    reservasHoy: 0,
    ocupacion: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL; // ej: http://localhost:3001
        const res = await fetch(`${baseUrl}/api/superadmin/stats`);
        const data = await res.json();

        if (!data.ok) throw new Error("Error al obtener estadísticas");

        setStats({
          sucursalesActivas: data.sucursalesActivas,
          adminsActivos: data.adminsActivos,
          reservasHoy: data.reservasHoy,
          ocupacion: data.ocupacion,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas del superadmin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatOcupacion = (value) => `${value}%`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Panel Superadmin</h1>
          <p className="dashboard-subtitle">
            Controlá sucursales, administradores y reservas de todo el sistema.
          </p>
        </header>

        {loading && <p>Cargando estadísticas...</p>}

        {!loading && (
          <section className="dashboard-grid">
            {/* Sucursales */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">🏟️</div>
                <h2 className="dashboard-card-title">Sucursales</h2>
              </div>
              <p className="dashboard-card-text">
                Gestioná todas las sedes del complejo pádel.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">
                  {stats.sucursalesActivas}
                </span>
                <span className="dashboard-card-label">sucursales activas</span>
              </div>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/superadmin/sucursales")}
              >
                Ver sucursales
              </button>
            </article>

            {/* Administradores */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">🎾</div>
                <h2 className="dashboard-card-title">Administradores</h2>
              </div>
              <p className="dashboard-card-text">
                Creá, editá o eliminá admins y asignalos a sucursales.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">
                  {stats.adminsActivos}
                </span>
                <span className="dashboard-card-label">admins activos</span>
              </div>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/superadmin/sucursales")}
              >
                Gestionar admins
              </button>
            </article>

            {/* Reservas */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">📅</div>
                <h2 className="dashboard-card-title">Reservas</h2>
              </div>
              <p className="dashboard-card-text">
                Visualizá todas las reservas del sistema y filtrá por sucursal.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">
                  {stats.reservasHoy}
                </span>
                <span className="dashboard-card-label">reservas hoy</span>
              </div>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/superadmin/reservas")}
              >
                Ver reservas
              </button>
            </article>

            {/* Estadísticas */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">📊</div>
                <h2 className="dashboard-card-title">Estadísticas</h2>
              </div>
              <p className="dashboard-card-text">
                Consultá la ocupación general y la actividad por sucursal.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">
                  {formatOcupacion(stats.ocupacion)}
                </span>
                <span className="dashboard-card-label">ocupación promedio</span>
              </div>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/superadmin/reservas")}
              >
                Ver reportes
              </button>
            </article>
          </section>
        )}

        <section className="dashboard-section" style={{ marginTop: "30px" }}>
          <h2 className="dashboard-section-title">Últimas reservas</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Sucursal</th>
                <th>Cancha</th>
                <th>Fecha</th>
                <th>Horario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Pérez</td>
                <td>Sucursal Centro</td>
                <td>Cancha 1</td>
                <td>10/11/2025</td>
                <td>19:00 - 20:00</td>
              </tr>
              <tr>
                <td>Ana López</td>
                <td>Sucursal Norte</td>
                <td>Cancha 3</td>
                <td>10/11/2025</td>
                <td>21:00 - 22:00</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
