import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";       // Landing inicial
import Menu from "./pages/Menu";       // Menú interno después del login
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reservas from "./pages/Reservas"; // ✅ Página de reservas
import "./styles/App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial (landing con botón Comenzar) */}
        <Route path="/" element={<Home />} />

        {/* Menú principal luego de iniciar sesión */}
        <Route path="/home" element={<Menu />} />

        {/* Página de reservas */}
        <Route path="/reservas" element={<Reservas />} />

        {/* Páginas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
