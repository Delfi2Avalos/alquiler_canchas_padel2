import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { logout: authLogout } = useContext(AuthContext);

  const [stats, setStats] = useState({
    sucursalesActivas: 0,
    adminsActivos: 0,
    reservasTotales: 0, // 👈 ahora totales, no solo hoy
  });

  const [ultimasReservas, setUltimasReservas] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // estado para EDITAR jugador
  const [editJugador, setEditJugador] = useState(null);
  const [formJugador, setFormJugador] = useState({
    nombre: "",
    username: "",
    email: "",
    telefono: "",
  });

  // estado para ELIMINAR jugador
  const [deleteJugador, setDeleteJugador] = useState(null);

  // ==========================
  //   CARGAR STATS / LISTAS
  // ==========================
  const cargarDatos = async () => {
    try {
      // Traemos TODO y después calculamos en el front
      const [sucRes, reservasRes, adminsRes, jugRes] = await Promise.all([
        api.get("/sucursales/admin"),
        api.get("/reservas/admin"), // todas las reservas
        api.get("/admins"),
        api.get("/jugadores"),
      ]);

      const sucData = sucRes.data?.data || sucRes.data || [];
      const reservasData = reservasRes.data?.data || reservasRes.data || [];
      const adminsData = adminsRes.data?.admins || [];
      const jugadoresData = jugRes.data?.data || jugRes.data || [];

      const sucursalesActivas = Array.isArray(sucData) ? sucData.length : 0;
      const adminsActivos = Array.isArray(adminsData) ? adminsData.length : 0;
      const reservasTotales = Array.isArray(reservasData)
        ? reservasData.length
        : 0;

      // últimas 5 reservas (más recientes primero)
      const ultimas = Array.isArray(reservasData)
        ? [...reservasData]
            .sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
            .slice(0, 5)
        : [];

      setStats({ sucursalesActivas, adminsActivos, reservasTotales });
      setUltimasReservas(ultimas);
      setJugadores(Array.isArray(jugadoresData) ? jugadoresData : []);
    } catch (error) {
      console.error("Error al cargar estadísticas del superadmin:", error);
      setStats({
        sucursalesActivas: 0,
        adminsActivos: 0,
        reservasTotales: 0,
      });
      setUltimasReservas([]);
      setJugadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatearFecha = (iso) => {
    if (!iso) return "-";
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  };

  const formatearHorario = (inicio, fin) => {
    if (!inicio || !fin) return "-";
    const h1 = inicio.slice(11, 16);
    const h2 = fin.slice(11, 16);
    return `${h1} - ${h2}`;
  };

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  // ==========================
  //   EDITAR JUGADOR
  // ==========================
  const abrirEditarJugador = (j) => {
    setEditJugador(j);
    setFormJugador({
      nombre: j.nombre || "",
      username: j.username || "",
      email: j.email || "",
      telefono: j.telefono || "",
    });
  };

  const handleChangeJugador = (e) => {
    const { name, value } = e.target;
    setFormJugador((prev) => ({ ...prev, [name]: value }));
  };

  const guardarJugador = async (e) => {
    e.preventDefault();
    if (!editJugador) return;

    try {
      await api.put(`/jugadores/${editJugador.id_usuario}`, formJugador);
      alert("Jugador actualizado correctamente");
      setEditJugador(null);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el jugador");
    }
  };

  // ==========================
  //   ELIMINAR JUGADOR
  // ==========================
  const confirmarEliminarJugador = (j) => {
    setDeleteJugador(j);
  };

  const eliminarJugador = async () => {
    if (!deleteJugador) return;
    try {
      await api.delete(`/jugadores/${deleteJugador.id_usuario}`);
      alert("Jugador eliminado correctamente");
      setDeleteJugador(null);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el jugador");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div>
              <h1 className="dashboard-title">Panel Superadmin</h1>
              <p className="dashboard-subtitle">
                Controlá sucursales, administradores, reservas y pagos de todo
                el sistema.
              </p>
            </div>

            <button
              className="dashboard-logout-button"
              type="button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
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

            {/* Reservas TOTALES */}
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">📅</div>
                <h2 className="dashboard-card-title">Reservas</h2>
              </div>
              <p className="dashboard-card-text">
                Visualizá todas las reservas registradas en el sistema.
              </p>
              <div className="dashboard-card-info">
                <span className="dashboard-card-number">
                  {stats.reservasTotales}
                </span>
                <span className="dashboard-card-label">
                  reservas totales
                </span>
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

        {/* Últimas reservas (datos reales) */}
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
              {ultimasReservas.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay reservas para mostrar.</td>
                </tr>
              ) : (
                ultimasReservas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>{r.usuario}</td>
                    <td>{r.sucursal}</td>
                    <td>{r.cancha}</td>
                    <td>{formatearFecha(r.inicio)}</td>
                    <td>{formatearHorario(r.inicio, r.fin)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Jugadores registrados */}
        <section className="dashboard-section" style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2 className="dashboard-section-title">Jugadores registrados</h2>
            <button
              className="dashboard-card-button"
              style={{ padding: "8px 14px" }}
              onClick={() => navigate("/superadmin/jugadores")}
            >
              Gestionar en vista completa
            </button>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay jugadores registrados.</td>
                </tr>
              ) : (
                jugadores.slice(0, 10).map((j) => (
                  <tr key={j.id_usuario}>
                    <td>{j.nombre}</td>
                    <td>{j.username}</td>
                    <td>{j.email}</td>
                    <td>{j.telefono || "-"}</td>
                    <td>
                      <button
                        className="dashboard-btn-edit"
                        onClick={() => abrirEditarJugador(j)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="dashboard-btn-delete"
                        style={{ marginLeft: "8px" }}
                        onClick={() => confirmarEliminarJugador(j)}
                      >
                        🗑 Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* MODAL EDITAR JUGADOR */}
      {editJugador && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">
              Editar jugador: {editJugador.username}
            </h2>

            <form className="modal-form" onSubmit={guardarJugador}>
              <label>Nombre completo</label>
              <input
                name="nombre"
                value={formJugador.nombre}
                onChange={handleChangeJugador}
                required
              />

              <label>Usuario</label>
              <input
                name="username"
                value={formJugador.username}
                onChange={handleChangeJugador}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formJugador.email}
                onChange={handleChangeJugador}
                required
              />

              <label>Teléfono</label>
              <input
                name="telefono"
                value={formJugador.telefono}
                onChange={handleChangeJugador}
              />

              <div className="modal-actions">
                <button type="submit" className="dashboard-card-button">
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setEditJugador(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR JUGADOR */}
      {deleteJugador && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Eliminar jugador</h2>
            <p>
              ¿Seguro que querés eliminar al jugador{" "}
              <strong>{deleteJugador.username}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="modal-actions">
              <button
                className="dashboard-btn-delete"
                type="button"
                onClick={eliminarJugador}
              >
                Sí, eliminar
              </button>
              <button
                className="modal-cancel"
                type="button"
                onClick={() => setDeleteJugador(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
