import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import "../styles/App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // loginService debería devolver algo como:
      // { token, user: { id, role, username, sucursal } }
      const res = await loginService({ username, password });
      console.log("Usuario logueado:", res);

      if (res?.user) {
        // Guardamos el usuario en el contexto (y en localStorage dentro del AuthContext)
        authLogin(res.user);
      }

      // Por ahora mandamos siempre a /home
      // Más adelante podemos hacer:
      // if (res.user.role === "SUPERADMIN") navigate("/superadmin/dashboard") ...
      navigate("/home");
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        "Nombre de usuario o contraseña incorrectos";
      setError(msg);
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Bienvenido al sistema de reservas de pádel</h1>

      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">Accedé con tu cuenta para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
