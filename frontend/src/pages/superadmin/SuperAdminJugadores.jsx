import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import api from "../../api";

export default function SuperAdminJugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editJugador, setEditJugador] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    username: "",
    email: "",
    telefono: "",
    dni: "",
    activo: true,
  });

  const loadJugadores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jugadores");
      const data = res.data?.data || res.data || [];
      setJugadores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando jugadores:", err);
      setJugadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJugadores();
  }, []);

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
      loadJugadores();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar jugador");
    }
  };

  const eliminar = async (j) => {
    if (!window.confirm(`¿Desactivar al jugador "${j.nombre}"?`)) return;

    try {
      await api.delete(`/jugadores/${j.id_usuario}`);
      alert("Jugador desactivado");
      loadJugadores();
    } catch (err) {
      console.error(err);
      alert("Error al desactivar jugador");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Gestión de jugadores</h1>
          <p className="dashboard-subtitle">
            El Superadmin puede ver, editar y desactivar jugadores del sistema.
          </p>
        </header>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Jugadores registrados</h2>

          {loading ? (
            <p>Cargando jugadores...</p>
          ) : jugadores.length === 0 ? (
            <p>No hay jugadores registrados.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
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
                {jugadores.map((j) => (
                  <tr key={j.id_usuario}>
                    <td>{j.id_usuario}</td>
                    <td>{j.nombre}</td>
                    <td>{j.username}</td>
                    <td>{j.email}</td>
                    <td>{j.telefono || "-"}</td>
                    <td>{j.dni}</td>
                    <td>{j.activo ? "Sí" : "No"}</td>
                    <td>
  <button
    className="btn-accion editar"
    onClick={() => handleEditar(jugador)}
  >
    Modificar
  </button>

  <button
    className="btn-accion eliminar"
    onClick={() => handleEliminar(jugador)}
  >
    Eliminar
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* MODAL EDITAR */}
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

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
