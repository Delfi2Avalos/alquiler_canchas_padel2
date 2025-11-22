import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function SuperAdminSucursales() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Formulario de creación / edición
  const emptyForm = {
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    hora_apertura: "08:00:00",
    hora_cierre: "23:00:00",
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // Helper para fetch con token
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type":
        options.method && options.method !== "GET"
          ? "application/json"
          : (options.headers && options.headers["Content-Type"]) || undefined,
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    return res;
  };

  // Cargar sucursales (lista admin)
  const loadSucursales = async () => {
    try {
      setLoading(true);

      const res = await authFetch(`${baseUrl}/api/sucursales/admin`, {
        method: "GET",
      });

      if (!res.ok) {
        console.error("Status sucursales/admin:", res.status);
        throw new Error("No se pudieron cargar las sucursales");
      }

      const data = await res.json();
      // listarSucursalesAdmin devuelve directamente un array (rows)
      setSucursales(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error("Error al cargar sucursales (admin):", e);
      alert("No se pudieron cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
  }, []);

  // Crear Sucursal
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${baseUrl}/api/sucursales`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        alert(data.msg || "Error al crear sucursal");
        return;
      }

      alert(data.msg || "Sucursal creada");
      setShowCreateModal(false);
      setForm(emptyForm);
      loadSucursales();
    } catch (e) {
      console.error("Error al crear sucursal:", e);
      alert("Error al crear sucursal");
    }
  };

  // Abrir modal de edición
  const openEditModal = (s) => {
    setEditId(s.id_sucursal);
    setForm({
      nombre: s.nombre,
      email: s.email || "",
      telefono: s.telefono || "",
      direccion: s.direccion || "",
      ciudad: s.ciudad || "",
      provincia: s.provincia || "",
      hora_apertura: s.hora_apertura || "08:00:00",
      hora_cierre: s.hora_cierre || "23:00:00",
    });
    setShowEditModal(true);
  };

  // Guardar edición
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${baseUrl}/api/sucursales/${editId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        alert(data.msg || "Error al actualizar sucursal");
        return;
      }

      alert(data.msg || "Sucursal actualizada");
      setShowEditModal(false);
      setForm(emptyForm);
      setEditId(null);
      loadSucursales();
    } catch (e) {
      console.error("Error al actualizar sucursal:", e);
      alert("Error al actualizar sucursal");
    }
  };

  // Eliminar sucursal
  const deleteSucursal = async (id) => {
    if (!confirm("¿Eliminar sucursal? Esta acción no se puede deshacer.")) return;

    try {
      const res = await authFetch(`${baseUrl}/api/sucursales/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        alert(data.msg || "Error al eliminar sucursal");
        return;
      }

      alert(data.msg || "Sucursal eliminada");
      loadSucursales();
    } catch (e) {
      console.error("Error al eliminar sucursal:", e);
      alert("Error al eliminar sucursal");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Sucursales</h1>
          <p className="dashboard-subtitle">
            Gestioná todas las sedes del sistema.
          </p>

          <button
            className="dashboard-card-button"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Crear sucursal
          </button>
        </header>

        {loading ? (
          <p>Cargando sucursales...</p>
        ) : (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Listado de sucursales</h2>

            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Provincia</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {sucursales.map((s) => (
                  <tr key={s.id_sucursal}>
                    <td>{s.nombre}</td>
                    <td>{s.ciudad}</td>
                    <td>{s.provincia}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.telefono || "-"}</td>

                    <td>
                      <button
                        className="dashboard-btn-edit"
                        onClick={() => openEditModal(s)}
                      >
                        Modificar
                      </button>

                      <button
                        className="dashboard-btn-delete"
                        onClick={() => deleteSucursal(s.id_sucursal)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {sucursales.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay sucursales cargadas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* -------- MODAL CREAR -------- */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Crear sucursal</h2>

            <form className="modal-form" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Dirección"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Provincia"
                value={form.provincia}
                onChange={(e) =>
                  setForm({ ...form, provincia: e.target.value })
                }
                required
              />

              <label>Horario apertura</label>
              <input
                type="time"
                value={form.hora_apertura}
                onChange={(e) =>
                  setForm({ ...form, hora_apertura: e.target.value })
                }
                required
              />

              <label>Horario cierre</label>
              <input
                type="time"
                value={form.hora_cierre}
                onChange={(e) =>
                  setForm({ ...form, hora_cierre: e.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button type="submit" className="dashboard-card-button">
                  Crear
                </button>

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- MODAL EDITAR -------- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Editar sucursal</h2>

            <form className="modal-form" onSubmit={handleEdit}>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Dirección"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Provincia"
                value={form.provincia}
                onChange={(e) =>
                  setForm({ ...form, provincia: e.target.value })
                }
                required
              />

              <label>Horario apertura</label>
              <input
                type="time"
                value={form.hora_apertura}
                onChange={(e) =>
                  setForm({ ...form, hora_apertura: e.target.value })
                }
                required
              />

              <label>Horario cierre</label>
              <input
                type="time"
                value={form.hora_cierre}
                onChange={(e) =>
                  setForm({ ...form, hora_cierre: e.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button type="submit" className="dashboard-card-button">
                  Guardar cambios
                </button>

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setForm(emptyForm);
                    setEditId(null);
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
