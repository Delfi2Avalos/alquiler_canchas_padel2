import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/jugador.css";

export default function Perfil() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);

  const loadPerfil = async () => {
    try {
      const res = await api.get("/usuarios/me");
      setForm({
        nombre: res.data.nombre || "",
        email: res.data.email || "",
        telefono: res.data.telefono || "",
        password: "",
      });
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/usuarios/me", form);
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      alert("Error actualizando perfil");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="jugador-container">
      <h1>Mi Perfil</h1>

      <div className="perfil-box">
        <label>Nombre completo</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />

        <label>Nueva contraseña (opcional)</label>
        <input
          type="password"
          name="password"
          placeholder="Dejar vacío para no cambiar"
          value={form.password}
          onChange={handleChange}
        />

        <button className="btn-confirmar" onClick={handleSave}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
