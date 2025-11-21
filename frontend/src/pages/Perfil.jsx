import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);

  const cargar = async () => {
    try {
      const res = await api.get("/usuario/perfil");
      setPerfil(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (!perfil) return <div className="jugador-container"><h2>Cargando...</h2></div>;

  return (
    <div className="jugador-container">
      <h1>Mi Perfil</h1>

      <div className="perfil-box">

        <p><strong>Usuario:</strong> {perfil.username}</p>
        <p><strong>Nombre:</strong> {perfil.nombre}</p>
        <p><strong>DNI:</strong> {perfil.dni}</p>
        <p><strong>Teléfono:</strong> {perfil.telefono || "-"}</p>
        <p><strong>Email:</strong> {perfil.email}</p>

        <button
          className="btn-confirmar"
          onClick={() => navigate("/perfil/editar")}
        >
          Editar Perfil
        </button>

        <button className="start-btn" onClick={() => navigate("/home")}>
          Volver al menú
        </button>
      </div>
    </div>
  );
}
