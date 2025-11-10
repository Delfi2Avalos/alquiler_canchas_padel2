import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Perfil() {
  const { user } = useContext(AuthContext);
  if (!user) return <div className="container"><p>No estás logueado.</p></div>;

  return (
    <div className="container">
      <h2>Mi Perfil</h2>
      <p><strong>Usuario:</strong> {user.username}</p>
      <p><strong>Nombre:</strong> {user.nombre || user.email}</p>
      <p><strong>Rol:</strong> {user.role} {user.adminType ? `(${user.adminType})` : ""}</p>
      <p><strong>Teléfono:</strong> {user.telefono}</p>
    </div>
  );
}
