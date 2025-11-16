import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function SuperAdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-container">
      <h1>Panel del Superadmin</h1>
      <p>Bienvenido, {user?.username}</p>

      <ul>
        <li>Gestionar sucursales</li>
        <li>Gestionar admins (más adelante)</li>
        <li>Ver reservas de todas las sucursales</li>
      </ul>
    </div>
  );
}
