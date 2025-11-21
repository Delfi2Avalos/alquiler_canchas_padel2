import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../styles/jugador.css";

export default function ElegirFecha() {
  const { sucursalId, canchaId } = useParams();
  const [fecha, setFecha] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const sucursalNombre = location.state?.sucursalNombre || "";
  const canchaNombre = location.state?.canchaNombre || "";

  const hoy = new Date().toISOString().split("T")[0];

  const continuar = () => {
    if (!fecha) return alert("Debés elegir una fecha.");

    if (fecha < hoy) {
      return alert("No podés elegir una fecha pasada.");
    }

    navigate(`/reservar/${sucursalId}/${canchaId}/${fecha}/horarios`, {
      state: { sucursalNombre, canchaNombre },
    });
  };

  return (
    <div className="jugador-container">
      <h1>Elegí una fecha</h1>

      <input
        type="date"
        value={fecha}
        min={hoy}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button className="btn-confirmar" onClick={continuar}>
        Ver horarios
      </button>
    </div>
  );
}
