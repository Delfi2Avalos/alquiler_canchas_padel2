import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import Home from "./pages/Home";      // landing inicial
import Menu from "./pages/Menu";      // menú interno después del login
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

// Rutas que solo necesitan usuario logueado
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

//  Rutas restringidas por rol
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

  // Función para decidir a dónde va cada tipo de usuario
  const getRedirectPathForUser = () => {
    if (!user) return "/login";

    const role = (user.role || "").toUpperCase();

    if (role === "SUPERADMIN") return "/superadmin/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/home"; // jugador u otro
  };

  return (
    <Routes>
      {/* Landing inicial */}
      <Route path="/" element={<Home />} />

      {/* Menú principal logueado */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Menu />
          </RequireAuth>
        }
      />

      {/* Reservas (usuario jugador) */}
      <Route
        path="/reservas"
        element={
          <RequireAuth>
            <Reservas />
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

      {/* LOGIN: redirección POR ROL si ya está logueado */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={getRedirectPathForUser()} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* REGISTER: si ya está logueado, también lo mando según su rol */}
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

      {/* Rutas inexistentes */}
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
