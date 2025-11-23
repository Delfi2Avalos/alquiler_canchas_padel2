import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/App.css";

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleStart = () => {
    
    if (user) logout();
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Oscurece la imagen */}
      <div className="overlay"></div>

      {/* Contenido */}
      <div className="home-content">
        <h1 className="home-title">Sistema de reservas de canchas de Pádel</h1>
        <p className="home-subtitle">
          Cada partido empieza con una buena organización. Nosotros te ayudamos.
        </p>

        <button className="start-btn" onClick={handleStart}>
          Comenzar
        </button>
      </div>
    </div>
  );
}
