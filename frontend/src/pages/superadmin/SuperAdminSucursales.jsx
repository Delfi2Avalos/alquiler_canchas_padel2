import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

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

  /* =========================================================
     Cargar sucursales
  ========================================================== */
  const loadSucursales = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/sucursales/admin`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok === false) throw new Error(data.msg);

      // El backend devuelve un array directo → lo usamos así
      setSucursales(data);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
      alert("No se pudieron cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
  }, []);

  /* =========================================================
     Crear sucursal
  ========================================================== */
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/sucursales`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.ok === false) {
        alert(data.msg || "Error al crear");
        return;
      }

      alert("Sucursal creada correctamente");

      setShowCreateModal(false);
      setForm(emptyForm);
      loadSucursales();
    } catch (err) {
      console.error("Error al crear:", err);
      alert("Error al crear la sucursal");
    }
  };

  /* =========================================================
     Abrir modal edición
  ========================================================== */
  const openEditModal = (s) => {
    setEditId(s.id_sucursal);
    setForm({
      nombre: s.nombre || "",
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

  /* =========================================================
     Guardar edición
  ========================================================== */
  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/sucursales/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.ok === false) {
        alert(data.msg || "Error al editar");
        return;
      }

      alert("Sucursal actualizada correctamente");

      setShowEditModal(false);
      setForm(emptyForm);
      setEditId(null);
      loadSucursales();
    } catch (err) {
      console.error("Error al editar:", err);
      alert("Error al actualizar la sucursal");
    }
  };

  /* =========================================================
     Eliminar sucursal
  ========================================================== */
  const deleteSucursal = async (id) => {
    if (!confirm("¿Eliminar sucursal? Esta acción es permanente.")) return;

    try {
      const res = await fetch(`${baseUrl}/api/sucursales/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok === false) {
        alert(data.msg || "Error al eliminar");
        return;
      }

      alert("Sucursal eliminada");
      loadSucursales();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar la sucursal");
    }
  };

  /* =========================================================
     Render principal
  ========================================================== */

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
                  <th style={{ width: "120px" }}>Acciones</th>
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
                        ✏️
                      </button>

                      <button
                        className="dashboard-btn-delete"
                        onClick={() => deleteSucursal(s.id_sucursal)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {sucursales.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                      No hay sucursales registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* =========================================================
          MODAL CREAR
      ========================================================== */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Crear sucursal</h2>

            <form className="modal-form" onSubmit={handleCreate}>
              {Object.keys(emptyForm).map((key) =>
                key.includes("hora") ? (
                  <>
                    <label>{key.replace("_", " ")}</label>
                    <input
                      key={key}
                      type="time"
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      required
                    />
                  </>
                ) : (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    required={["nombre", "ciudad", "provincia"].includes(key)}
                  />
                )
              )}

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

      {/* =========================================================
          MODAL EDITAR
      ========================================================== */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Editar sucursal</h2>

            <form className="modal-form" onSubmit={handleEdit}>
              {Object.keys(emptyForm).map((key) =>
                key.includes("hora") ? (
                  <>
                    <label>{key.replace("_", " ")}</label>
                    <input
                      key={key}
                      type="time"
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      required
                    />
                  </>
                ) : (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    required={["nombre", "ciudad", "provincia"].includes(key)}
                  />
                )
              )}

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
