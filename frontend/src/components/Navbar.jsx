import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <div className="navbar">
      <div>
        <Link to="/">Pádel</Link>
        <Link to="/canchas">Canchas</Link>
        {user && <Link to="/reservas">Mis reservas</Link>}
      </div>
      <div>
        {user ? (
          <>
            <span>{user.username || user.nombre || user.email}</span>
            <button onClick={handleLogout} style={{ marginLeft: 10 }}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </div>
  );
}
