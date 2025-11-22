import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import "./styles/App.css";
import { AuthProvider, AuthContext } from "./context/AuthContext";

/* ========================================= */
/*                PUBLIC PAGES               */
/* ========================================= */
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ========================================= */
/*                 JUGADOR                   */
/* ========================================= */
import Reservas from "./pages/Reservas";
import ElegirSucursal from "./pages/jugador/ElegirSucursal";
import ElegirCancha from "./pages/jugador/ElegirCancha";
import ElegirFecha from "./pages/jugador/ElegirFecha";
import ElegirHorario from "./pages/jugador/ElegirHorario";
import Confirmacion from "./pages/jugador/Confirmacion";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import JugadorNotificaciones from "./pages/JugadorNotificaciones";

/* ========================================= */
/*                    ADMIN                  */
/* ========================================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminCanchas from "./pages/admin/AdminCanchas";
// import AdminPagos from "./pages/admin/AdminPagos";  // 🔥 OCULTO
import AdminReportes from "./pages/admin/AdminReportes";

/* ========================================= */
/*                 SUPERADMIN                */
/* ========================================= */
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminSucursales from "./pages/superadmin/SuperAdminSucursales";
import SuperAdminReservas from "./pages/superadmin/SuperAdminReservas";
// import SuperAdminPagos from "./pages/superadmin/SuperAdminPagos"; // 🔥 OCULTO
import SuperAdminJugadores from "./pages/superadmin/SuperAdminJugadores";
import SuperAdminAdmins from "./pages/superadmin/SuperAdminAdmins";
import SuperAdminReportes from "./pages/superadmin/SuperAdminReportes";

/* ========================================= */
/*              AUTH PROTECTIONS             */
/* ========================================= */

function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RequireRole({ roles, children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const userRole = (user.role || "").toUpperCase();
  const allowed = roles.map((r) => r.toUpperCase());

  if (!allowed.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

/* ========================================= */
/*                ROUTING TABLE              */
/* ========================================= */

function AppRoutes() {
  const { user } = useContext(AuthContext);

  const getRedirectPathForUser = () => {
    if (!user) return "/login";

    const role = (user.role || "").toUpperCase();
    if (role === "SUPERADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/home"; // jugador
  };

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />

      {/* JUGADOR */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Menu />
          </RequireAuth>
        }
      />

      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <Perfil />
          </RequireAuth>
        }
      />

      <Route
        path="/perfil/editar"
        element={
          <RequireAuth>
            <EditarPerfil />
          </RequireAuth>
        }
      />

      <Route
        path="/reservas"
        element={
          <RequireAuth>
            <Reservas />
          </RequireAuth>
        }
      />

      {/* NOTIFICACIONES */}
      <Route
        path="/notificaciones"
        element={
          <RequireAuth>
            <JugadorNotificaciones />
          </RequireAuth>
        }
      />

      {/* ========== FLUJO JUGADOR ========== */}
      <Route
        path="/reservar"
        element={
          <RequireAuth>
            <ElegirSucursal />
          </RequireAuth>
        }
      />

      <Route
        path="/reservar/:sucursalId/canchas"
        element={
          <RequireAuth>
            <ElegirCancha />
          </RequireAuth>
        }
      />

      <Route
        path="/reservar/:sucursalId/:canchaId/fecha"
        element={
          <RequireAuth>
            <ElegirFecha />
          </RequireAuth>
        }
      />

      <Route
        path="/reservar/:sucursalId/:canchaId/:fecha/horarios"
        element={
          <RequireAuth>
            <ElegirHorario />
          </RequireAuth>
        }
      />

      <Route
        path="/reservar/confirmacion"
        element={
          <RequireAuth>
            <Confirmacion />
          </RequireAuth>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/admin/reservas"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminReservas />
          </RequireRole>
        }
      />

      <Route
        path="/admin/canchas"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminCanchas />
          </RequireRole>
        }
      />

      {/*  PAGOS OCULTOS
      <Route
        path="/admin/pagos"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminPagos />
          </RequireRole>
        }
      />
      */}

      <Route
        path="/admin/reportes"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminReportes />
          </RequireRole>
        }
      />

      {/* SUPERADMIN */}
      <Route
        path="/superadmin/dashboard"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/superadmin/sucursales"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminSucursales />
          </RequireRole>
        }
      />

      <Route
        path="/superadmin/reservas"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminReservas />
          </RequireRole>
        }
      />

      {/* 🔥 PAGOS OCULTOS
      <Route
        path="/superadmin/pagos"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminPagos />
          </RequireRole>
        }
      />
      */}

      <Route
        path="/superadmin/jugadores"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminJugadores />
          </RequireRole>
        }
      />

      <Route
        path="/superadmin/admins"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminAdmins />
          </RequireRole>
        }
      />

      <Route
        path="/superadmin/reportes"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminReportes />
          </RequireRole>
        }
      />

      {/* LOGIN & REGISTER */}
      <Route
        path="/login"
        element={
          user ? <Navigate to={getRedirectPathForUser()} replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={getRedirectPathForUser()} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
