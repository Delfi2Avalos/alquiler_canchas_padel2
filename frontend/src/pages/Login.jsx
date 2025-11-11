import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@test.com" && password === "1234") {
      alert("Inicio de sesión exitoso ");
      navigate("/home");
    } else {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">
        Bienvenido al sistema de reservas de canchas de pádel
      </h1>

      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">Accedé con tu cuenta para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
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

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Iniciar sesión
          </button>
        </form>

        <p className="register-text">
          ¿No tenés cuenta?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            Registrarse
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;