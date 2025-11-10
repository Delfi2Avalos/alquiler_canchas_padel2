import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Canchas from "./pages/Canchas";
import Reservas from "./pages/Reservas";
import Perfil from "./pages/Perfil";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // allowedRoles puede contener 'JUGADOR', 'ADMIN', 'SUCURSAL', 'SUPER', etc.
  if (allowedRoles.length === 0) return children;

  const role = user.role;
  const adminType = user.adminType || user.subrole || null;

  if (allowedRoles.includes(role) || (adminType && allowedRoles.includes(adminType))) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/canchas"
          element={
            <ProtectedRoute allowedRoles={["JUGADOR", "ADMIN", "SUCURSAL", "SUPER"]}>
              <Canchas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute allowedRoles={["JUGADOR", "ADMIN", "SUCURSAL", "SUPER"]}>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute allowedRoles={["JUGADOR", "ADMIN", "SUCURSAL", "SUPER"]}>
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
