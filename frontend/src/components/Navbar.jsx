import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">🏓 Pádel Center</Link>
        <div>
          {user ? (
            <>
              <span className="text-white me-3">Hola, {user.nombre}</span>
              <button onClick={logout} className="btn btn-light btn-sm">Salir</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
              <Link className="btn btn-light" to="/register">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
