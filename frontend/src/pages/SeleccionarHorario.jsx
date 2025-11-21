import { useEffect, useState } from "react";
import {
  getHorariosDisponibles,
  crearReserva
} from "../services/reservasService";

export default function SeleccionarHorario({ idCancha, fecha, precioHora }) {
  const [horarios, setHorarios] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const res = await getHorariosDisponibles(idCancha, fecha);
        setHorarios(res); // el backend ya devuelve lista
      } catch (err) {
        console.error("Error cargando horarios", err);
      }
    };

    if (idCancha && fecha) cargarHorarios();
  }, [idCancha, fecha]);

  const reservar = async () => {
    if (!seleccion) return;

    const inicio = `${fecha}T${seleccion}:00`;
    const fin = `${fecha}T${sumarUnaHora(seleccion)}:00`;

    try {
      const res = await crearReserva({
        id_cancha: idCancha,
        inicio,
        fin,
        precio_total: precioHora
      });

      setMensaje("Reserva creada correctamente. Estado: PENDIENTE.");
    } catch (err) {
      setMensaje(err.response?.data?.message || "Error al crear reserva");
    }
  };

  return (
    <div className="horarios-container">
      <h2>Selecciona un horario</h2>

      <div className="grid-horarios">
        {horarios.map((h) => (
          <button
            key={h.hora}
            disabled={h.estado !== "LIBRE"}
            className={`celda-horario ${
              h.estado === "LIBRE" ? "libre" : "ocupado"
            } ${seleccion === h.hora ? "seleccionado" : ""}`}
            onClick={() => setSeleccion(h.hora)}
          >
            {h.hora}
          </button>
        ))}
      </div>

      <button onClick={reservar} disabled={!seleccion} className="btn-confirmar">
        Confirmar Reserva
      </button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

function sumarUnaHora(hora) {
  const [h] = hora.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:00`;
}
