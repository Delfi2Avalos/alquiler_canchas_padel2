import React, { createContext, useEffect, useState } from "react";
import { authLogout } from "../services/authService";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si existe token pero no user, intentar pedir perfil al backend
    const token = localStorage.getItem("token");
    if (token && !user) {
      (async () => {
        try {
          setLoading(true);
          const res = await api.get("/auth/me"); // requiere que tu backend tenga /auth/me
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          // no hacer más: token inválido
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
