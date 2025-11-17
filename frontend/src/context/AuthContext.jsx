import React, { createContext, useEffect, useState } from "react";
import { logout as authLogout } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Normaliza el rol siempre a MAYÚSCULAS
  const normalizeUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      role: (userData.role || "").toUpperCase(), // 👈 Normalización importante
    };
  };

  // Cargar usuario guardado al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const normalized = normalizeUser(parsed);
        setUser(normalized);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login: guardamos usuario normalizado
  const login = (userData) => {
    const normalized = normalizeUser(userData);

    setUser(normalized);

    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
    } else {
      localStorage.removeItem("user");
    }
  };

  // Logout: limpiar token/usuario
  const logout = () => {
    authLogout();
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
