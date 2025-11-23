import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";

export default function AdminSucursal() {
  const baseUrl = import.meta.env.VITE_API_URL;

  const [sucursal, setSucursal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);

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

  //CARGAR SUCURSAL DEL ADMIN
  const loadSucursal = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/sucursales/mi`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data && data.id_sucursal) {
        setSucursal(data);
      }
    } catch (err) {
      console.error("Error cargando la sucursal del admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursal();
  }, []);

  //ABRIR MODAL DE EDICIÓN
  const openEdit = () => {
    setForm({
      nombre: sucursal.nombre,
      email: sucursal.email || "",
      telefono: sucursal.telefono || "",
      direccion: sucursal.direccion || "",
      ciudad: sucursal.ciudad,
      provincia: sucursal.provincia,
      hora_apertura: sucursal.hora_apertura,
      hora_cierre: sucursal.hora_cierre,
    });

    setShowEditModal(true);
  };

  //GUARDAR CAMBIOS
  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/sucursales/${sucursal.id_sucursal}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.msg || "Sucursal actualizada");

      if (data.ok !== false) {
        setShowEditModal(false);
        loadSucursal();
      }
    } catch (err) {
      console.error("Error actualizando sucursal:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Mi sucursal</h1>
          <p className="dashboard-subtitle">
            Administrá la información de tu sucursal.
          </p>
        </header>

        {loading ? (
          <p>Cargando datos...</p>
        ) : sucursal ? (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">
              Información de la sucursal
            </h2>

            <table className="dashboard-table">
              <tbody>
                <tr>
                  <th>Nombre</th>
                  <td>{sucursal.nombre}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{sucursal.email || "-"}</td>
                </tr>
                <tr>
                  <th>Teléfono</th>
                  <td>{sucursal.telefono || "-"}</td>
                </tr>
                <tr>
                  <th>Dirección</th>
                  <td>{sucursal.direccion || "-"}</td>
                </tr>
                <tr>
                  <th>Ciudad</th>
                  <td>{sucursal.ciudad}</td>
                </tr>
                <tr>
                  <th>Provincia</th>
                  <td>{sucursal.provincia}</td>
                </tr>
                <tr>
                  <th>Horario</th>
                  <td>
                    {sucursal.hora_apertura} — {sucursal.hora_cierre}
                  </td>
                </tr>
              </tbody>
            </table>

            <button className="dashboard-card-button" onClick={openEdit}>
              ✏️ Editar sucursal
            </button>
          </section>
        ) : (
          <p>No se encontró tu sucursal.</p>
        )}
      </main>

      {/* ======================
          MODAL EDITAR
      ====================== */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Editar sucursal</h2>

            <form className="modal-form" onSubmit={handleEdit}>
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
                onChange={(e) =>
                  setForm({ ...form, ciudad: e.target.value })
                }
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
                  onClick={() => setShowEditModal(false)}
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
