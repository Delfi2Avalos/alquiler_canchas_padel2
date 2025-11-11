// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/App.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    dni: "",
    username: "",
    email: "",
    telefono: "",
    password: "",
  });

  // Manejo de cambios de inputs
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      // Solo números y máximo 8
      if (/^\d{0,8}$/.test(value)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    } else if (name === "telefono") {
      // Solo números, cualquier longitud
      if (/^\d*$/.test(value)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Envío del registro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form); // Llamada al backend
      alert(`Usuario ${form.nombre} registrado correctamente 🎉`);
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.msg || "Error al registrar";
      alert(msg);
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Registrate en el sistema de reservas</h1>

      <div className="login-card">
        <h2 className="login-title">Crear cuenta</h2>
        <p className="login-subtitle">Completá los datos para registrarte</p>

        <form onSubmit={handleRegister} className="login-form">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={onChange}
            required
          />
          <input
            name="dni"
            type="text"
            placeholder="DNI (solo números)"
            value={form.dni}
            onChange={onChange}
            required
          />
          <input
            name="username"
            type="text"
            placeholder="Nombre de usuario"
            value={form.username}
            onChange={onChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            name="telefono"
            type="text"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={onChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={onChange}
            required
          />

          <button type="submit" className="login-btn">
            Registrarse
          </button>
        </form>

        <p className="register-text">
          ¿Ya tenés cuenta?{" "}
          <span className="register-link" onClick={() => navigate("/login")}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}
