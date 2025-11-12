import { useNavigate } from "react-router-dom";
import "../styles/App.css";

export default function Menu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="menu-container">
      {/* Fondo con imagen */}
      <div className="menu-overlay"></div>

      {/* Barra superior */}
      <nav className="menu-navbar">
        <h2 className="menu-title">Sistema de Reservas</h2>
        <div className="menu-links">
          <button onClick={() => navigate("/reservas")} className="menu-btn">
            Reservas
          </button>
          <button onClick={() => navigate("/perfil")} className="menu-btn">
            Perfil
          </button>
          <button onClick={handleLogout} className="menu-btn logout">
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido central */}
      <div className="menu-content">
        <h1 className="menu-heading">¡Bienvenido al sistema de reservas de pádel!</h1>
        <p className="menu-subtext">
          Gestioná tus reservas, consultá tus turnos y disfrutá del mejor pádel con nosotros.
        </p>

        <button className="start-btn" onClick={() => navigate("/reservas")}>
          Hacer una reserva
        </button>
      </div>
    </div>
  );
}
