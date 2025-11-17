import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-container">
      {/* LOGO + TÍTULO */}
      <div className="navbar-logo">
        <img src="/img/logo-padel.jpg" alt="logo" className="navbar-logo-img" />
        <span className="navbar-title">PÁDEL GOYA</span>
      </div>

      {/* LINKS */}
      <nav className={`navbar-links ${open ? "open" : ""}`}>
        {!user && (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}

        {user && user.role === "JUGADOR" && (
          <>
            <Link to="/home">Inicio</Link>
            <Link to="/reservas">Reservar</Link>
            <Link to="/perfil">Mi Perfil</Link>
          </>
        )}

        {user && user.role === "ADMIN" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/reservas">Reservas</Link>
            <Link to="/admin/canchas">Canchas</Link>
          </>
        )}

        {user && user.role === "SUPERADMIN" && (
          <>
            <Link to="/superadmin/dashboard">Dashboard</Link>
            <Link to="/superadmin/sucursales">Sucursales</Link>
            <Link to="/superadmin/reservas">Reservas</Link>
          </>
        )}

        {user && (
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </nav>

      {/* BOTÓN HAMBURGUESA */}
      <div className="navbar-toggle" onClick={() => setOpen(!open)}>
        ☰
      </div>
    </header>
  );
}
