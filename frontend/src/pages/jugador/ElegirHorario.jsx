import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "../../styles/jugador.css";

export default function ElegirHorario() {
  const { sucursalId, canchaId, fecha } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const canchaNombre = location.state?.canchaNombre || "";
  const sucursalNombre = location.state?.sucursalNombre || "";

  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [ocupados, setOcupados] = useState([]);
  const [error, setError] = useState("");

  const cargarOcupados = async () => {
    try {
      const res = await api.get(`/reservas/ocupados/${canchaId}/${fecha}`);
      setOcupados(res.data.data || []);
    } catch (error) {
      console.error("Error al cargar horarios ocupados:", error);
    }
  };

  useEffect(() => {
    cargarOcupados();
  }, []);

  const seSuperpone = () => {
    if (!horaInicio || !horaFin) return false;

    const inicioNuevo = new Date(`${fecha}T${horaInicio}:00`);
    const finNuevo = new Date(`${fecha}T${horaFin}:00`);

    return ocupados.some((r) => {
      const inicioExistente = new Date(r.inicio);
      const finExistente = new Date(r.fin);

      return (
        (inicioNuevo >= inicioExistente && inicioNuevo < finExistente) ||
        (finNuevo > inicioExistente && finNuevo <= finExistente) ||
        (inicioNuevo <= inicioExistente && finNuevo >= finExistente)
      );
    });
  };

  const continuar = () => {
    setError("");

    if (!horaInicio || !horaFin)
      return setError("Debés elegir una hora de inicio y una hora de fin.");

    if (horaFin <= horaInicio)
      return setError("La hora de fin debe ser mayor a la de inicio.");

    if (seSuperpone())
      return setError("Ese horario está ocupado. Elegí otro.");

    navigate("/reservar/confirmacion", {
      state: {
        sucursalId,
        canchaId,
        fecha,
        horaInicio,
        horaFin,
        canchaNombre,
        sucursalNombre,
        modo: "solicitud",
      },
    });
  };

  return (
    <div className="jugador-container">
      <h1>Elegí horario libre</h1>

      <h3>
        {sucursalNombre && canchaNombre
          ? `${sucursalNombre} — ${canchaNombre}`
          : ""}
      </h3>

      <h4>{fecha}</h4>

      <div className="ocupados-box">
        <h3>Horarios ocupados</h3>
        {ocupados.length === 0 ? (
          <p>No hay horarios ocupados</p>
        ) : (
          ocupados.map((r, i) => (
            <p key={i}>
              ⛔ {r.inicio.slice(11, 16)} - {r.fin.slice(11, 16)}
            </p>
          ))
        )}
      </div>

      <div className="form-horarios">
        <label>Hora de inicio:</label>
        <input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
        />

        <label>Hora de fin:</label>
        <input
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}
      </div>

      <button className="btn-confirmar" onClick={continuar}>
        Continuar
      </button>
    </div>
  );
}
