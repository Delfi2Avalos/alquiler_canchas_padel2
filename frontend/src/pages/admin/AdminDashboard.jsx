import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-container">
      <h1>Panel del Admin</h1>
      <p>Bienvenido, {user?.username}</p>
      <p>Sucursal ID: {user?.sucursal ?? "Sin sucursal"}</p>

      <ul>
        <li>Ver y gestionar reservas de mi sucursal</li>
        <li>Ver y gestionar canchas de mi sucursal</li>
      </ul>
    </div>
  );
}
