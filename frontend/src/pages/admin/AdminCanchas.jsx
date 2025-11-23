import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import api from "../../api"; //axios con baseURL + token

export default function AdminCanchas() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  //Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const emptyForm = {
    nombre: "",
    cubierta: 0,
    iluminacion: 1,
    piso: "CESPED",
    paredes: "ALAMBRADO",
    observaciones: "",
    estado: "ACTIVA",
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  //CARGAR CANCHAS (MI SUCURSAL)
  const loadCanchas = async () => {
    try {
      setLoading(true);

      const res = await api.get("/canchas/mi");
      const data = res.data?.data || res.data || [];
      setCanchas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando canchas:", err?.response?.data || err);
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCanchas();
  }, []);

  //CREAR CANCHA
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        cubierta: Number(form.cubierta),
        iluminacion: Number(form.iluminacion),
      };

      const res = await api.post("/canchas", payload);
      const data = res.data;

      alert(data.msg || "Cancha creada");

      if (data.id_cancha || data.ok !== false) {
        setShowCreateModal(false);
        setForm(emptyForm);
        loadCanchas();
      }
    } catch (err) {
      console.error("Error creando cancha:", err?.response?.data || err);
      alert("Error creando cancha");
    }
  };

  //EDITAR CANCHA
  const openEditModal = (c) => {
    setEditId(c.id_cancha);
    setForm({
      nombre: c.nombre,
      cubierta: c.cubierta ? 1 : 0,
      iluminacion: c.iluminacion ? 1 : 0,
      piso: c.piso || "CESPED",
      paredes: c.paredes || "ALAMBRADO",
      observaciones: c.observaciones || "",
      estado: c.estado || "ACTIVA",
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        cubierta: Number(form.cubierta),
        iluminacion: Number(form.iluminacion),
      };

      const res = await api.put(`/canchas/${editId}`, payload);
      const data = res.data;

      alert(data.msg || "Cancha actualizada");

      if (data.ok !== false) {
        setShowEditModal(false);
        setForm(emptyForm);
        setEditId(null);
        loadCanchas();
      }
    } catch (err) {
      console.error("Error editando cancha:", err?.response?.data || err);
      alert("Error editando cancha");
    }
  };

  //ELIMINAR CANCHA
  const deleteCancha = async (id) => {
    if (!confirm("¿Eliminar esta cancha?")) return;

    try {
      const res = await api.delete(`/canchas/${id}`);
      const data = res.data;

      alert(data.msg || "Cancha eliminada");

      if (data.ok !== false) loadCanchas();
    } catch (err) {
      console.error("Error eliminando cancha:", err?.response?.data || err);
      alert("Error eliminando cancha");
    }
  };

  //UI
  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Canchas</h1>
          <p className="dashboard-subtitle">
            Administrá las canchas de tu sucursal.
          </p>

          <button
            className="dashboard-card-button"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Crear cancha
          </button>
        </header>

        {/* LISTADO */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Listado de canchas</h2>

          {loading ? (
            <p>Cargando canchas...</p>
          ) : canchas.length === 0 ? (
            <p>No hay canchas registradas para tu sucursal.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cubierta</th>
                  <th>Iluminación</th>
                  <th>Piso</th>
                  <th>Paredes</th>
                  <th>Obs.</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {canchas.map((c) => (
                  <tr key={c.id_cancha}>
                    <td>{c.nombre}</td>
                    <td>{c.cubierta ? "Sí" : "No"}</td>
                    <td>{c.iluminacion ? "Sí" : "No"}</td>
                    <td>{c.piso}</td>
                    <td>{c.paredes}</td>
                    <td>{c.observaciones || "-"}</td>

                    <td>
                      <button
                        className="dashboard-btn-edit"
                        onClick={() => openEditModal(c)}
                      >
                        Modificar
                      </button>

                      <button
                        className="dashboard-btn-delete"
                        onClick={() => deleteCancha(c.id_cancha)}
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

      {/* ======================
          MODAL CREAR
      ====================== */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Crear cancha</h2>

            <form className="modal-form" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                required
              />

              <label>Cubierta</label>
              <select
                value={form.cubierta}
                onChange={(e) =>
                  setForm({ ...form, cubierta: Number(e.target.value) })
                }
              >
                <option value={0}>No</option>
                <option value={1}>Sí</option>
              </select>

              <label>Iluminación</label>
              <select
                value={form.iluminacion}
                onChange={(e) =>
                  setForm({ ...form, iluminacion: Number(e.target.value) })
                }
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>

              <label>Piso</label>
              <select
                value={form.piso}
                onChange={(e) =>
                  setForm({ ...form, piso: e.target.value })
                }
              >
                <option value="CESPED">Césped</option>
                <option value="CEMENTO">Cemento</option>
                <option value="MIXTO">Mixto</option>
              </select>

              <label>Paredes</label>
              <select
                value={form.paredes}
                onChange={(e) =>
                  setForm({ ...form, paredes: e.target.value })
                }
              >
                <option value="ALAMBRADO">Alambrado</option>
                <option value="VIDRIO">Vidrio</option>
                <option value="MIXTAS">Mixtas</option>
              </select>

              <textarea
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                rows={3}
                style={{ padding: "10px", borderRadius: "10px" }}
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

      {/* ======================
          MODAL EDITAR
      ====================== */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Editar cancha</h2>

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

              <label>Cubierta</label>
              <select
                value={form.cubierta}
                onChange={(e) =>
                  setForm({ ...form, cubierta: Number(e.target.value) })
                }
              >
                <option value={0}>No</option>
                <option value={1}>Sí</option>
              </select>

              <label>Iluminación</label>
              <select
                value={form.iluminacion}
                onChange={(e) =>
                  setForm({ ...form, iluminacion: Number(e.target.value) })
                }
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>

              <label>Piso</label>
              <select
                value={form.piso}
                onChange={(e) =>
                  setForm({ ...form, piso: e.target.value })
                }
              >
                <option value="CESPED">Césped</option>
                <option value="CEMENTO">Cemento</option>
                <option value="MIXTO">Mixto</option>
              </select>

              <label>Paredes</label>
              <select
                value={form.paredes}
                onChange={(e) =>
                  setForm({ ...form, paredes: e.target.value })
                }
              >
                <option value="ALAMBRADO">Alambrado</option>
                <option value="VIDRIO">Vidrio</option>
                <option value="MIXTAS">Mixtas</option>
              </select>

              <textarea
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                rows={3}
                style={{ padding: "10px", borderRadius: "10px" }}
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
