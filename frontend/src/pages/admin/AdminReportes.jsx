import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";
import api from "../../api";

export default function AdminReportes() {
  const navigate = useNavigate();

  const [canchas, setCanchas] = useState([]);
  const [horariosMasUsados, setHorariosMasUsados] = useState([]);
  const [horariosVacios, setHorariosVacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError("");

      const [canchasRes, masRes, vaciosRes] = await Promise.all([
        api.get("/reportes/admin/canchas-mas-reservadas"),
        api.get("/reportes/admin/horarios-mas-usados"),
        api.get("/reportes/admin/horarios-vacios"),
      ]);

      setCanchas(canchasRes.data?.data || []);
      setHorariosMasUsados(masRes.data?.data || []);
      setHorariosVacios(vaciosRes.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Error al cargar los reportes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div
        className="admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1>Reportes de la sucursal</h1>
          <p>
            Análisis de canchas más reservadas y horarios con mayor/menor uso.
          </p>
        </div>

        <button className="admin-btn" onClick={() => navigate("/admin/dashboard")}>
          Volver al panel
        </button>
      </div>

      {loading && <p>Cargando reportes...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {/* 1) CANCHAS MÁS RESERVADAS */}
          <div className="admin-section">
            <h2>Canchas más reservadas</h2>
            {canchas.length === 0 ? (
              <p>No hay reservas registradas en esta sucursal.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cancha</th>
                    <th>Sucursal</th>   {/* ← NUEVA COLUMNA */}
                    <th>Total de reservas</th>
                  </tr>
                </thead>
                <tbody>
                  {canchas.map((c) => (
                    <tr key={c.id_cancha}>
                      <td>{c.cancha}</td>
                      <td>{c.sucursal}</td> {/* ← MOSTRAR SUCURSAL */}
                      <td>{c.total_reservas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 2) HORARIOS MÁS USADOS */}
          <div className="admin-section">
            <h2>Horarios más usados</h2>
            {horariosMasUsados.length === 0 ? (
              <p>No hay reservas registradas para calcular horarios.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hora de inicio</th>
                    <th>Cantidad de usos</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosMasUsados.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.hora}</td>
                      <td>{h.usos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 3) HORARIOS VACÍOS / MENOS USADOS */}
          <div className="admin-section">
            <h2>Horarios con menos uso</h2>
            <p style={{ marginBottom: "0.5rem" }}>
              Incluye todos los horarios estándar de la sucursal, con su cantidad de usos.
            </p>

            {horariosVacios.length === 0 ? (
              <p>No hay información de horarios.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Usos</th>
                  </tr>
                </thead>
                <tbody>
                  {horariosVacios.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.hora}</td>
                      <td>{h.usos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
