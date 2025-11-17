import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useContext } from "react";

// Páginas principales
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

// SUPERADMIN
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminSucursales from "./pages/superadmin/SuperAdminSucursales";
import SuperAdminReservas from "./pages/superadmin/SuperAdminReservas";

// 👉 NUEVO: Panel de Administradores
import SuperAdminAdmins from "./pages/superadmin/SuperAdminAdmins";

// ----------- PROTECCIÓN GENERAL (NECESITA LOGIN) -----------
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ----------- PROTECCIÓN POR ROLES -----------
function RequireRole({ roles, children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("RequireRole -> user del contexto:", user);

  const userRole = (user.role || "").toUpperCase();
  const allowed = roles.map((r) => r.toUpperCase());

  if (!allowed.includes(userRole)) {
    console.log("RequireRole -> acceso denegado, redirijo a /home");
    return <Navigate to="/home" replace />;
  }

  console.log("RequireRole -> acceso permitido");
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
      {/* L A N D I N G */}
      <Route path="/" element={<Home />} />

      {/* MENÚ DEL JUGADOR */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Menu />
          </RequireAuth>
        }
      />

      {/* RESERVAS (jugador) */}
      <Route
        path="/reservas"
        element={
          <RequireAuth>
            <Reservas />
          </RequireAuth>
        }
      />

      {/* -------- ADMIN -------- */}
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

      {/* -------- SUPERADMIN -------- */}
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

      {/* 👉 NUEVO PANEL DE ADMINISTRADORES */}
      <Route
        path="/superadmin/admins"
        element={
          <RequireRole roles={["SUPERADMIN"]}>
            <SuperAdminAdmins />
          </RequireRole>
        }
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? <Navigate to={getRedirectPathForUser()} replace /> : <Login />
        }
      />

      {/* REGISTER */}
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

      {/* RUTAS INEXISTENTES */}
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

