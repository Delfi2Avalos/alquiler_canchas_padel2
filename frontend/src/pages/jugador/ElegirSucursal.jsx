import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/jugador.css";

export default function ElegirSucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarSucursales = async () => {
    try {
      const res = await api.get("/sucursales");
      console.log("RESPUESTA /sucursales:", res.data);

      const data =
        Array.isArray(res.data) ? res.data :
        Array.isArray(res.data.data) ? res.data.data :
        [];

      setSucursales(data);
    } catch (err) {
      console.error("Error cargando sucursales:", err);
      setSucursales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  if (loading) {
    return (
      <div className="jugador-container">
        <h1>Elegí una sucursal</h1>
        <p>Cargando sucursales...</p>
      </div>
    );
  }

  return (
    <div className="jugador-container">
      <h1>Elegí una sucursal</h1>

      {sucursales.length === 0 ? (
        <p>No hay sucursales disponibles.</p>
      ) : (
        <div className="lista-sucursales">
          {sucursales.map((s) => (
            <div className="card-sucursal" key={s.id_sucursal}>
              <h2>{s.nombre}</h2>

              <button
                className="btn-confirmar"
                onClick={() =>
                  navigate(`/reservar/${s.id_sucursal}/canchas`, {
                    state: { sucursalNombre: s.nombre },
                  })
                }
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
