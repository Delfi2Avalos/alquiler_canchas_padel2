import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import "../styles/App.css";
import "../styles/jugador.css";

export default function Menu() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();          
    navigate("/login");
  };

  return (
    <div className="menu-container jugador-home">

      {/* NAVBAR */}
      <nav className="menu-navbar jugador-navbar">
        <h2 className="menu-title">Sistema de Reservas</h2>

        <div className="menu-links">

          <button onClick={() => navigate("/reservar")} className="menu-btn">
            Reservar cancha
          </button>

          <button onClick={() => navigate("/reservas")} className="menu-btn">
            Mis reservas
          </button>

          <button onClick={() => navigate("/notificaciones")} className="menu-btn">
            Notificaciones
          </button>

          <button onClick={() => navigate("/perfil")} className="menu-btn">
            Perfil
          </button>

          <button onClick={handleLogout} className="menu-btn logout">
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO CENTRAL */}
      <div className="menu-content jugador-welcome-box">
        <h1>¡Bienvenido!</h1>

        <p className="jugador-sub">
          Elegí tu sucursal, seleccioná cancha y reservá tu turno al instante.
        </p>

        <button
          className="start-btn jugador-start-btn"
          onClick={() => navigate("/reservar")}
        >
          Hacer una reserva
        </button>
      </div>
    </div>
  );
}
