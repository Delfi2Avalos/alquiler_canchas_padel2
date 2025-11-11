import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Usuario ${nombre} registrado correctamente 🎉`);
    navigate("/");
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
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Registrarse
          </button>
        </form>

        <p className="register-text">
          ¿Ya tenés cuenta?{" "}
          <span className="register-link" onClick={() => navigate("/")}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
