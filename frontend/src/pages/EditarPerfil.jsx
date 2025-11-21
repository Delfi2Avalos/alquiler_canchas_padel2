import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    dni: "",
    telefono: "",
    email: "",
  });

  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      const res = await api.get("/usuario/perfil");
      setForm(res.data.data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Solo números en DNI y Teléfono
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setForm({ ...form, [name]: value });
    }
  };

  // Email y Nombre normales
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    setError("");

    // Validaciones FRONTEND:
    if (!form.nombre.trim()) return setError("El nombre es obligatorio");

    if (!/^\d{7,8}$/.test(form.dni))
      return setError("El DNI debe tener 7 u 8 números");

    if (form.telefono && !/^\d{7,15}$/.test(form.telefono))
      return setError("El teléfono debe contener solo números");

    if (!/\S+@\S+\.\S+/.test(form.email))
      return setError("El email no es válido");

    try {
      await api.put("/usuario/perfil", form);
      alert("Datos actualizados correctamente");
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError("No se pudieron actualizar los datos");
    }
  };

  return (
    <div className="jugador-container">
      <h1>Editar Perfil</h1>

      <div className="perfil-box">

        {error && <p className="error-text">{error}</p>}

        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleInput}
        />

        <label>DNI</label>
        <input
          type="text"
          name="dni"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.dni}
          onChange={handleNumberInput}
        />

        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.telefono || ""}
          onChange={handleNumberInput}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInput}
        />

        <button className="btn-confirmar" onClick={guardar}>
          Guardar cambios
        </button>

        <button className="start-btn" onClick={() => navigate("/perfil")}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
