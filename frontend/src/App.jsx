import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";       // Landing inicial
import Menu from "./pages/Menu";       // Menú interno después del login
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reservas from "./pages/Reservas"; // Página de reservas
import "./styles/App.css";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// PÁGINAS DE ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminCanchas from "./pages/admin/AdminCanchas";

// PÁGINAS DE SUPERADMIN
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminSucursales from "./pages/superadmin/SuperAdminSucursales";
import SuperAdminReservas from "./pages/superadmin/SuperAdminReservas";

// Componente para proteger rutas que requieren usuario logueado
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Si no hay usuario, redirigimos a /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Componente para proteger rutas por rol
function RequireRole({ roles, children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // role viene del backend como "JUGADOR", "ADMIN" o "SUPERADMIN"
  if (!roles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Página inicial (landing con botón Comenzar) */}
      <Route path="/" element={<Home />} />

      {/* Menú principal luego de iniciar sesión (requiere login) */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Menu />
          </RequireAuth>
        }
      />

      {/* Página de reservas (requiere login) */}
      <Route
        path="/reservas"
        element={
          <RequireAuth>
            <Reservas />
          </RequireAuth>
        }
      />

      {/* Sección ADMIN: solo rol ADMIN */}
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

      {/* Sección SUPERADMIN: solo rol SUPERADMIN */}
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

      {/* Páginas de autenticación */}
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/home" replace /> : <Register />}
      />

      {/* Redirección para rutas inexistentes */}
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
