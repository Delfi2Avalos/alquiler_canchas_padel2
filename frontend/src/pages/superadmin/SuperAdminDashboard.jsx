import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    sucursalesActivas: 0,
    adminsActivos: 0,
    reservasHoy: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fecha de hoy en formato YYYY-MM-DD para el filtro de reservas
        const hoy = new Date().toISOString().slice(0, 10);

        const [sucRes, reservasRes, adminsRes] = await Promise.all([
          // Sucursales públicas
          fetch(`${baseUrl}/api/sucursales`, {
            credentials: "include",
          }),
          // Reservas globales, filtradas por fecha de hoy
          fetch(`${baseUrl}/api/reservas/admin?fecha=${hoy}`, {
            credentials: "include",
          }),
          // Lista de administradores
          fetch(`${baseUrl}/api/admins`, {
            credentials: "include",
          }),
        ]);

        const sucData = await sucRes.json();
        const reservasData = await reservasRes.json();
        const adminsData = await adminsRes.json();

        // Contar sucursales
        const getCountGeneric = (data) => {
          if (Array.isArray(data)) return data.length;
          if (Array.isArray(data.data)) return data.data.length;
          if (typeof data.total === "number") return data.total;
          if (typeof data.cantidad === "number") return data.cantidad;
          return 0;
        };

        const sucursalesActivas = getCountGeneric(sucData);

        // Contar admins (según lo que devuelve tu /api/admins)
        let adminsActivos = 0;
        if (adminsData && Array.isArray(adminsData.admins)) {
          adminsActivos = adminsData.admins.length;
        }

        // Contar reservas de hoy (según /api/reservas/admin)
        const reservasHoy = getCountGeneric(reservasData);

        setStats({
          sucursalesActivas,
          adminsActivos,
          reservasHoy,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas del superadmin:", error);
        setStats({
          sucursalesActivas: 0,
          adminsActivos: 0,
          reservasHoy: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [baseUrl]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Panel Superadmin</h1>
          <p className="dashboard-subtitle">
            Controlá sucursales, administradores, reservas y pagos de todo el sistema.
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
                Gestioná todas las sedes del complejo de pádel.
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

            {/* Reservas de hoy */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">📅</div>
                <h2 className="dashboard-card-title">Reservas de hoy</h2>
              </div>
              <p className="dashboard-card-text">
                Visualizá las reservas registradas para la fecha actual.
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

            {/* Pagos */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">💳</div>
                <h2 className="dashboard-card-title">Pagos</h2>
              </div>
              <p className="dashboard-card-text">
                Consultá todos los pagos del sistema y revisá comprobantes.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">-</span>
                <span className="dashboard-card-label">
                  pagos (ver detalle en la sección)
                </span>
              </div>
              <button
                className="dashboard-card-button"
                onClick={() => navigate("/superadmin/pagos")}
              >
                Ver pagos
              </button>
            </article>
          </section>
        )}

        {/* Sección inferior de ejemplo (se puede conectar más adelante) */}
        <section className="dashboard-section" style={{ marginTop: "30px" }}>
          <h2 className="dashboard-section-title">Últimas reservas (ejemplo)</h2>
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
