import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/App.css";

export default function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    // Aquí se enviaría la info a la API para registrar
    alert(`Usuario ${nombre} registrado correctamente 🎉`);
    navigate("/login");
  };

  // Validar DNI: solo números, máximo 8 caracteres
  const handleDniChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,8}$/.test(value)) {
      setDni(value);
    }
  };

  // Validar teléfono: solo números, máximo 15 caracteres
  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,15}$/.test(value)) {
      setTelefono(value);
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
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={handleDniChange}
            required
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={handleTelefonoChange}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">Registrarse</button>
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
