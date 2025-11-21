import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { logout: authLogout } = useContext(AuthContext);

  // Estadísticas tarjetas
  const [stats, setStats] = useState({
    sucursalesActivas: 0,
    adminsActivos: 0,
    reservasTotales: 0,
  });

  // Últimas reservas
  const [ultimasReservas, setUltimasReservas] = useState([]);

  // Jugadores
  const [jugadores, setJugadores] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Modal edición jugador
  const [editJugador, setEditJugador] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    username: "",
    email: "",
    telefono: "",
    dni: "",
    activo: true,
  });

  const [loading, setLoading] = useState(true);

  // ---------- helpers de formato ----------
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

  // ---------- lectura de arrays según formatos típicos ----------
  const asArray = (res, keyPreferida) => {
    if (!res || !res.data) return [];
    const d = res.data;

    if (Array.isArray(d)) return d; // respuesta = [...]

    if (keyPreferida && Array.isArray(d[keyPreferida])) return d[keyPreferida];

    if (Array.isArray(d.data)) return d.data;

    // buscar la primera propiedad que sea array
    for (const v of Object.values(d)) {
      if (Array.isArray(v)) return v;
    }

    return [];
  };

  // ---------- cargar datos ----------
  const fetchData = async () => {
    try {
      setLoading(true);

      const [sucRes, adminsRes, reservasRes, jugRes] = await Promise.all([
        api.get("/sucursales"),
        api.get("/admins"),
        api.get("/reservas/admin"),
        api.get("/jugadores").catch((e) => {
          // si /jugadores da 500, no tiramos abajo todo el dashboard
          console.error("Error en /api/jugadores:", e?.response?.data || e);
          return null;
        }),
      ]);

      // sucursales: suele ser { ok, data: [...] }
      const sucursales = asArray(sucRes, "sucursales");
      // admins: suele ser { ok, admins: [...] }
      const admins = asArray(adminsRes, "admins");
      // reservas: suele ser { ok, data: [...] } o { ok, reservas: [...] }
      const reservas = asArray(reservasRes, "reservas");

      setStats({
        sucursalesActivas: sucursales.length,
        adminsActivos: admins.length,
        reservasTotales: reservas.length,
      });

      const ultimas = [...reservas]
        .sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
        .slice(0, 5);
      setUltimasReservas(ultimas);

      // jugadores (si el endpoint falló, jugRes será null → dejamos vacío)
      const jugadoresList = jugRes ? asArray(jugRes, "jugadores") : [];
      setJugadores(jugadoresList);
      setListaFiltrada(jugadoresList);
    } catch (err) {
      console.error("Error al cargar datos del panel superadmin:", err);
      setStats({
        sucursalesActivas: 0,
        adminsActivos: 0,
        reservasTotales: 0,
      });
      setUltimasReservas([]);
      setJugadores([]);
      setListaFiltrada([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- buscador ----------
  const filtrarJugadores = (texto) => {
    setBusqueda(texto);
    const t = texto.toLowerCase();

    const filtrados = jugadores.filter((j) => {
      const nombre = (j.nombre || "").toLowerCase();
      const user = (j.username || "").toLowerCase();
      const email = (j.email || "").toLowerCase();
      return (
        nombre.includes(t) ||
        user.includes(t) ||
        email.includes(t)
      );
    });

    setListaFiltrada(filtrados);
  };

  // ---------- logout ----------
  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  // ---------- edición / borrado jugadores ----------
  const abrirEditar = (j) => {
    setEditJugador(j);
    setForm({
      nombre: j.nombre || "",
      username: j.username || "",
      email: j.email || "",
      telefono: j.telefono || "",
      dni: j.dni || "",
      activo: j.activo === 1 || j.activo === true,
    });
  };

  const cerrarModal = () => {
    setEditJugador(null);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!editJugador) return;

    try {
      await api.put(`/jugadores/${editJugador.id_usuario}`, form);
      alert("Jugador actualizado correctamente");
      cerrarModal();
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar jugador");
    }
  };

  const eliminarJugador = async (j) => {
    if (!window.confirm(`¿Eliminar / desactivar al jugador "${j.nombre}"?`)) {
      return;
    }
    try {
      await api.delete(`/jugadores/${j.id_usuario}`);
      alert("Jugador eliminado / desactivado");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar jugador");
    }
  };

  // ---------- render ----------
  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        {/* Header + logout */}
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
                Controlá sucursales, administradores, reservas y pagos.
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
          <>
            {/* Tarjetas superiores */}
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
                  <span className="dashboard-card-label">
                    sucursales activas
                  </span>
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
                  <div className="dashboard-card-icon">👤</div>
                  <h2 className="dashboard-card-title">Administradores</h2>
                </div>
                <p className="dashboard-card-text">
                  Creá y gestioná admins asignados a sucursales.
                </p>
                <div className="dashboard-card-info">
                  <span className="dashboard-card-number">
                    {stats.adminsActivos}
                  </span>
                  <span className="dashboard-card-label">admins activos</span>
                </div>
                <button
                  className="dashboard-card-button"
                  onClick={() => navigate("/superadmin/admins")}
                >
                  Gestionar admins
                </button>
              </article>

              {/* Reservas (total) */}
              <article className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-icon">📅</div>
                  <h2 className="dashboard-card-title">Reservas</h2>
                </div>
                <p className="dashboard-card-text">
                  Visualizá todas las reservas globales del sistema.
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
                  Consultá pagos y comprobantes registrados.
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

            {/* Últimas reservas */}
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
              <h2 className="dashboard-section-title">Jugadores registrados</h2>

              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o email..."
                className="buscar-input"
                value={busqueda}
                onChange={(e) => filtrarJugadores(e.target.value)}
              />

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>DNI</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No hay jugadores registrados.</td>
                    </tr>
                  ) : (
                    listaFiltrada.map((j) => (
                      <tr
                        key={j.id_usuario}
                        className={!j.activo ? "fila-inactiva" : ""}
                      >
                        <td>{j.nombre}</td>
                        <td>{j.username}</td>
                        <td>{j.email}</td>
                        <td>{j.telefono || "-"}</td>
                        <td>{j.dni}</td>
                        <td>{j.activo ? "Sí" : "No"}</td>
                        <td>
                          <button
                            className="dashboard-btn-edit"
                            onClick={() => abrirEditar(j)}
                          >
                            Modificar
                          </button>
                          <button
                            className="dashboard-btn-delete"
                            onClick={() => eliminarJugador(j)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>

      {/* MODAL EDITAR JUGADOR */}
      {editJugador && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">
              Editar jugador #{editJugador.id_usuario}
            </h2>

            <form className="modal-form" onSubmit={guardarCambios}>
              <label>Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />

              <label>Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <label>Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />

              <label>DNI</label>
              <input
                type="text"
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
                required
              />

              <label
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.checked })
                  }
                />
                Activo
              </label>

              <div className="modal-actions">
                <button type="submit" className="dashboard-card-button">
                  Guardar
                </button>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={cerrarModal}
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
