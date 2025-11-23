import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/Dashboard.css";

export default function SuperAdminReportes() {
  const [reservasSucursales, setReservasSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  //Cargar informe
  const cargarReportes = async () => {
    try {
      const r1 = await api.get("/reportes/superadmin/reservas-por-sucursal");

      setReservasSucursales(r1.data.data || []);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content" style={{ paddingTop: 30 }}>
        <h1 className="dashboard-title">Reportes del Sistema</h1>
        <p className="dashboard-subtitle">
          Informes globales para el control del sistema.
        </p>

        {loading && <p>Cargando reportes...</p>}

        {!loading && (
          <>
            {/* --------------------------------------------------- */}
            {/* INFORME 1: TOTAL DE RESERVAS POR SUCURSAL */}
            {/* --------------------------------------------------- */}
            <section className="dashboard-section" style={{ marginTop: 20 }}>
              <h2 className="dashboard-section-title">
                Reservas por sucursal
              </h2>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Total de Reservas</th>
                  </tr>
                </thead>

                <tbody>
                  {reservasSucursales.length === 0 ? (
                    <tr>
                      <td colSpan="2">No hay datos disponibles.</td>
                    </tr>
                  ) : (
                    reservasSucursales.map((r) => (
                      <tr key={r.id_sucursal}>
                        <td>{r.sucursal}</td>
                        <td>{r.total_reservas}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
