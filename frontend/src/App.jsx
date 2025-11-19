import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reservas from "./pages/Reservas";

import "./styles/App.css";

import { AuthProvider, AuthContext } from "./context/AuthContext";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminCanchas from "./pages/admin/AdminCanchas";
import AdminPagos from "./pages/admin/AdminPagos";

// SUPERADMIN
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminSucursales from "./pages/superadmin/SuperAdminSucursales";
import SuperAdminReservas from "./pages/superadmin/SuperAdminReservas";
import SuperAdminPagos from "./pages/superadmin/SuperAdminPagos";
import SuperAdminJugadores from "./pages/superadmin/SuperAdminJugadores";
import SuperAdminAdmins from "./pages/superadmin/SuperAdminAdmins";

// -------------------------------
//   USUARIO LOGUEADO
// -------------------------------
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// -------------------------------
//   RESTRINGIR POR ROL
// -------------------------------
function RequireRole({ roles, children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || "").toUpperCase();
  const allowed = roles.map((r) => r.toUpperCase());

  if (!allowed.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

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
      {/* Landing */}
      <Route path="/" element={<Home />} />

      {/* Usuario logueado (jugador) */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Menu />
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

      {/* ---------------------- */}
      {/*       ADMIN           */}
      {/* ---------------------- */}
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

      <Route
        path="/admin/pagos"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminPagos />
          </RequireRole>
        }
      />

      {/* ---------------------- */}
      {/*     SUPERADMIN        */}
      {/* ---------------------- */}
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

      <Route
        path="/superadmin/pagos"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminPagos />
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


      {/* NUEVA RUTA → JUGADORES */}
      <Route
        path="/superadmin/jugadores"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminJugadores />
          </RequireRole>
        }
      />

      {/* ---------------------- */}
      {/*       LOGIN/REG        */}
      {/* ---------------------- */}
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

      {/* Catch-all */}
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

