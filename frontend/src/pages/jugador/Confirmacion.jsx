import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/jugador.css";

export default function ConfirmacionReserva() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state)
    return (
      <div className="jugador-container">
        <h2>Error: faltan datos</h2>
      </div>
    );

  const {
    sucursalNombre,
    canchaNombre,
    sucursalId,
    canchaId,
    fecha,
    horaInicio,
    horaFin,
  } = state;

  const enviarSolicitud = async () => {
    try {

      // FORMATO ISO QUE EL BACKEND EXIGE
      const inicio = `${fecha}T${horaInicio}`;
      const fin = `${fecha}T${horaFin}`;

      console.log("DEBUG → ENVIANDO:", {
        id_cancha: canchaId,
        inicio,
        fin,
        precio_total: 0
      });

      const res = await api.post("/reservas", {
        id_cancha: canchaId,
        inicio,
        fin,
        precio_total: 0  // YA NO USÁS PAGO → LO MANDO EN 0
      });

      alert("Solicitud enviada con éxito");
      navigate("/home");

    } catch (error) {
      console.error("ERROR RESERVA:", error.response?.data || error);
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <div className="jugador-container">
      <div className="perfil-box" style={{ maxWidth: "450px" }}>
        <h2>Solicitud de Reserva</h2>

        <p>
          <strong>Sucursal:</strong> {sucursalNombre || "Desconocida"}
        </p>
        <p>
          <strong>Cancha:</strong> {canchaNombre || "Desconocida"}
        </p>

        <p>
          <strong>Fecha:</strong> {fecha}
        </p>
        <p>
          <strong>Horario solicitado:</strong> {horaInicio} - {horaFin}
        </p>

        <p style={{ marginTop: 20 }}>
          Esta es una solicitud. El administrador revisará la disponibilidad y aprobará o rechazará tu reserva.
        </p>

        <button className="btn-confirmar" onClick={enviarSolicitud}>
          Enviar solicitud
        </button>
      </div>
    </div>
  );
}
