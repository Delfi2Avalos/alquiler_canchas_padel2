import { useNavigate } from "react-router-dom";
import "../styles/App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Capa semitransparente */}
      <div className="overlay"></div>

      {/* Contenido principal */}
      <div className="home-content">
        <h1 className="home-title">Sistema de reservas de canchas de Pádel</h1>
        <p className="home-subtitle">
          Cada partido empieza con una buena organización. Nosotros te ayudamos.
        </p>

        <button
          className="start-btn"
          onClick={() => navigate("/login")}
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}

export default Home;

