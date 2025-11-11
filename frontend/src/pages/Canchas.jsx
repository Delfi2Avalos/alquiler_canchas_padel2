import React, { useEffect, useState } from "react";
import { getCanchas } from "../services/canchaService";

export default function Canchas() {
  const [canchas, setCanchas] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCanchas();
        setCanchas(data);
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div className="container">
      <h2>Canchas</h2>
      {err && <p style={{color:'red'}}>{err}</p>}
      <table className="table">
        <thead><tr><th>Nombre</th><th>Sucursal</th><th>Cubierta</th><th>Iluminación</th></tr></thead>
        <tbody>
          {canchas.map(c => (
            <tr key={c.id_cancha}>
              <td>{c.nombre}</td>
              <td>{c.id_sucursal}</td>
              <td>{c.cubierta ? "Sí" : "No"}</td>
              <td>{c.iluminacion ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
