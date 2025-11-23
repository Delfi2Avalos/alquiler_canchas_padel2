import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getCanchas } from "../../services/canchasService";
import "../../styles/jugador.css";

export default function ElegirCancha() {
  const { sucursalId } = useParams();
  const location = useLocation();

  //Nombre de la sucursal desde ElegirSucursal
  const sucursalNombre = location.state?.sucursalNombre || "Sucursal";

  const [canchas, setCanchas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCanchas();
  }, []);

  const loadCanchas = async () => {
    try {
      const data = await getCanchas(sucursalId);
      setCanchas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando canchas:", err);
    }
  };

  return (
    <div className="jugador-container">
      <h1>Elegí una cancha</h1>
      <h2>{sucursalNombre}</h2>

      <div className="lista-canchas">
        {canchas.map((c) => (
          <div className="card-cancha" key={c.id_cancha}>
            <h3>{c.nombre}</h3>

            <div className="cancha-detalles">
              <p><strong>Piso:</strong> {c.piso}</p>
              <p><strong>Paredes:</strong> {c.paredes}</p>
              <p><strong>Cubierta:</strong> {c.cubierta ? "Sí" : "No"}</p>
              <p><strong>Iluminación:</strong> {c.iluminacion ? "Sí" : "No"}</p>
              {c.observaciones && (
                <p><strong>Observaciones:</strong> {c.observaciones}</p>
              )}
              <p><strong>Estado:</strong> {c.estado}</p>
            </div>

            <button
              className="btn-confirmar"
              onClick={() =>
                navigate(`/reservar/${sucursalId}/${c.id_cancha}/fecha`, {
                  state: {
                    sucursalNombre,
                    canchaNombre: c.nombre,
                  },
                })
              }
            >
              Elegir cancha
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
