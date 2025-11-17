import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function SuperAdminAdmins() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [admins, setAdmins] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------- Modal --------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // -------- Form --------
  const emptyForm = {
    nombre: "",
    username: "",
    email: "",
    telefono: "",
    dni: "",
    id_sucursal: "",
    password: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // ============================
  //   Cargar ADMINs
  // ============================
  const loadAdmins = async () => {
    const res = await fetch(`${baseUrl}/api/admins`);
    const data = await res.json();
    if (data.ok) setAdmins(data.admins);
  };

  // ============================
  //   Cargar Sucursales
  // ============================
  const loadSucursales = async () => {
    const res = await fetch(`${baseUrl}/api/sucursales`);
    const data = await res.json();
    if (Array.isArray(data)) setSucursales(data);
  };

  useEffect(() => {
    const fetchAll = async () => {
      await loadAdmins();
      await loadSucursales();
      setLoading(false);
    };
    fetchAll();
  }, []);

  // ============================
  //   Crear ADMIN
  // ============================
  const createAdmin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${baseUrl}/api/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.msg || "Admin creado");

    if (data.ok) {
      await loadAdmins();
      setForm(emptyForm);
      setShowCreateModal(false);
    }
  };

  // ============================
  //   Abrir Modal Editar
  // ============================
  const openEditModal = (admin) => {
    setEditId(admin.id_usuario);
    setForm({
      nombre: admin.nombre,
      username: admin.username, // no editable
      email: admin.email,
      telefono: admin.telefono || "",
      dni: admin.dni || "",
      id_sucursal: admin.id_sucursal || "",
      password: "", // no se muestra para edición
    });
    setShowEditModal(true);
  };

  // ============================
  //   Guardar Edición
  // ============================
  const editAdmin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${baseUrl}/api/admins/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.msg || "Admin actualizado");

    if (data.ok) {
      setShowEditModal(false);
      setForm(emptyForm);
      setEditId(null);
      loadAdmins();
    }
  };

  // ============================
  //   Eliminar
  // ============================
  const deleteAdmin = async (id) => {
    if (!confirm("¿Eliminar administrador?")) return;

    const res = await fetch(`${baseUrl}/api/admins/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    alert(data.msg);

    if (data.ok) loadAdmins();
  };

  // ============================
  //   UI
  // ============================
  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Administradores</h1>
          <p className="dashboard-subtitle">
            Gestioná todos los administradores del sistema.
          </p>

          <button
            className="dashboard-card-button"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Crear administrador
          </button>
        </header>

        {loading ? (
          <p>Cargando administradores...</p>
        ) : (
          <>
            {/* ============================
                TABLA
            ============================ */}
            <section className="dashboard-section">
              <h2 className="dashboard-section-title">Lista de administradores</h2>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Sucursal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id_usuario}>
                      <td>{a.nombre}</td>
                      <td>{a.username}</td>
                      <td>{a.email}</td>
                      <td>{a.telefono || "-"}</td>
                      <td>{a.sucursal || "Sin asignar"}</td>

                      <td>
                        <button
                          className="dashboard-btn-edit"
                          onClick={() => openEditModal(a)}
                        >
                          ✏️
                        </button>

                        <button
                          className="dashboard-btn-delete"
                          onClick={() => deleteAdmin(a.id_usuario)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ============================
                FORM CREAR ADMIN
            ============================ */}
            {showCreateModal && (
              <div className="modal-overlay">
                <div className="modal-container">
                  <h2 className="modal-title">Crear administrador</h2>

                  <form className="modal-form" onSubmit={createAdmin}>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Usuario"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
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
                      placeholder="DNI"
                      value={form.dni}
                      onChange={(e) =>
                        setForm({ ...form, dni: e.target.value })
                      }
                      required
                    />
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />

                    <select
                      value={form.id_sucursal}
                      onChange={(e) =>
                        setForm({ ...form, id_sucursal: e.target.value })
                      }
                    >
                      <option value="">Sin asignar</option>
                      {sucursales.map((s) => (
                        <option key={s.id_sucursal} value={s.id_sucursal}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>

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

            {/* ============================
                FORM EDITAR ADMIN
            ============================ */}
            {showEditModal && (
              <div className="modal-overlay">
                <div className="modal-container">
                  <h2 className="modal-title">Editar administrador</h2>

                  <form className="modal-form" onSubmit={editAdmin}>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />

                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={form.telefono}
                      onChange={(e) =>
                        setForm({ ...form, telefono: e.target.value })
                      }
                    />

                    <select
                      value={form.id_sucursal}
                      onChange={(e) =>
                        setForm({ ...form, id_sucursal: e.target.value })
                      }
                    >
                      <option value="">Sin asignar</option>
                      {sucursales.map((s) => (
                        <option key={s.id_sucursal} value={s.id_sucursal}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>

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
          </>
        )}
      </main>
    </div>
  );
}
