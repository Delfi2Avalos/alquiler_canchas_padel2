import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";       // Landing inicial
import Menu from "./pages/Menu";       // Menú interno después del login
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reservas from "./pages/Reservas"; // Página de reservas
import "./styles/App.css";
import { AuthProvider, AuthContext } from "./context/AuthContext";

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

      {/* Páginas de autenticación */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/home" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/home" replace /> : <Register />
        }
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
