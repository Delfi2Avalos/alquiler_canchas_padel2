import { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import api from "../../api";

export default function SuperAdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const asArray = (res, preferredKey) => {
    if (!res || !res.data) return [];
    const d = res.data;

    if (Array.isArray(d)) return d;
    if (preferredKey && Array.isArray(d[preferredKey])) return d[preferredKey];
    if (Array.isArray(d.data)) return d.data;

    for (const v of Object.values(d)) {
      if (Array.isArray(v)) return v;
    }
    return [];
  };

  const loadPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pagos/admin");
      const lista = asArray(res, "pagos");
      setPagos(lista);
      setErrorMsg("");
  
      console.log("Pagos recibidos:", lista);
    } catch (err) {
      console.error("Error cargando pagos:", err?.response?.data || err);
      if (err?.response?.status === 401) {
        setErrorMsg(
          "No autorizado: tu sesión puede haber expirado. Volvé a iniciar sesión."
        );
      } else {
        setErrorMsg("Error cargando pagos desde el servidor.");
      }
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);


  const getFecha = (pago) => {
    const raw =
      pago.fecha_pago ||
      pago.fecha ||
      pago.fecha_reserva ||
      pago.creado_en ||
      pago.created_at ||
      pago.fechaHora;

    if (!raw) return "-";

    const s = String(raw);

    if (s.length >= 10) {
      const [y, m, d] = s.slice(0, 10).split("-");
      if (y && m && d) return `${d}/${m}/${y}`;
      return s.slice(0, 10);
    }
    return s;
  };

  const getJugador = (pago) => {
    return (
      pago.jugador ||
      pago.nombre_jugador ||
      pago.usuario ||
      pago.nombre_usuario ||
      "-"
    );
  };

  const getMetodo = (pago) => {
    return pago.metodo || pago.metodo_pago || pago.forma_pago || "-";
  };

  const getSucursal = (pago) => {
    return pago.sucursal || pago.nombre_sucursal || "-";
  };

  const getCancha = (pago) => {
    return pago.cancha || pago.nombre_cancha || "-";
  };

  const getMonto = (pago) => {
    return pago.monto ?? pago.total ?? "-";
  };

  const getEstado = (pago) => {
    return pago.estado || "-";
  };

  //Buscador
  const pagosFiltrados = pagos.filter((p) => {
    if (!busqueda) return true;
    const t = busqueda.toLowerCase();

    const campos = [
      getJugador(p),
      getSucursal(p),
      getCancha(p),
      String(getMonto(p)),
      getMetodo(p),
      getEstado(p),
    ]
      .join(" ")
      .toLowerCase();

    return campos.includes(t);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Pagos</h1>
          <p className="dashboard-subtitle">
            Consultá pagos y comprobantes registrados.
          </p>
        </header>

        {loading && <p>Cargando pagos...</p>}

        {!loading && (
          <>
            {errorMsg && (
              <p style={{ color: "red", marginBottom: "15px" }}>{errorMsg}</p>
            )}

            <section className="dashboard-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h2 className="dashboard-section-title">Listado de pagos</h2>

                {/* Buscador */}
                <input
                  type="text"
                  placeholder="Buscar por jugador, sucursal, cancha, método o estado..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="buscar-input"
                  style={{ maxWidth: 360 }}
                />
              </div>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Jugador</th>
                    <th>Sucursal</th>
                    <th>Cancha</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No hay pagos para mostrar.</td>
                    </tr>
                  ) : (
                    pagosFiltrados.map((p) => (
                      <tr key={p.id_pago || p.id}>
                        <td>{getFecha(p)}</td>
                        <td>{getJugador(p)}</td>
                        <td>{getSucursal(p)}</td>
                        <td>{getCancha(p)}</td>
                        <td>{getMonto(p)}</td>
                        <td>{getMetodo(p)}</td>
                        <td>{getEstado(p)}</td>
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
