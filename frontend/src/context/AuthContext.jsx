import React, { createContext, useEffect, useState } from "react";
import { logout as authLogout } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Normaliza el rol siempre a MAYÚSCULAS
  const normalizeUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      role: (userData.role || "").toUpperCase(),
    };
  };

  // Cargar usuario al iniciar la app
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const normalized = normalizeUser(parsed);
        setUser(normalized);
      }
    } catch {
      localStorage.removeItem("user");
    }

    setLoading(false); // 👈 IMPORTANTE
  }, []);

  const login = (userData) => {
    const normalized = normalizeUser(userData);

    setUser(normalized);

    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
    } else {
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
