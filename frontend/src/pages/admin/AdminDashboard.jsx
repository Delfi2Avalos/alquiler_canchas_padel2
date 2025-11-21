import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";
import { AuthContext } from "../../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();              // limpia user + token
    navigate("/login");    // vuelve al login
  };

  return (
    <div className="admin-dashboard">
      {/* Título + botón cerrar sesión */}
      <div className="admin-header" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "1.5rem"
      }}>
        <h1>Panel del Administrador</h1>

        <button
          className="admin-btn logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>

      {/* RESERVAS */}
      <div className="admin-section">
        <h2>Reservas</h2>
        <p>Revisá y actualizá el estado de las reservas de tu sucursal.</p>
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/reservas")}
        >
          Ver reservas
        </button>
      </div>

      {/* CANCHAS */}
      <div className="admin-section">
        <h2>Canchas</h2>
        <p>Activá, desactivá o editá las canchas de tu sucursal.</p>
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/canchas")}
        >
          Gestionar canchas
        </button>
      </div>

      {/* PAGOS */}
      <div className="admin-section">
        <h2>Pagos</h2>
        <p>Verificá comprobantes y actualizá el estado de los pagos.</p>
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/pagos")}
        >
          Ver pagos
        </button>
      </div>
    </div>
  );
}
