import axios from "axios";

// Ejemplos de .env:
// VITE_API_URL=http://localhost:3001
// VITE_API_URL=http://192.168.1.38:3001
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  // Siempre va a pegarle a /api del backend
  baseURL: API_URL + "/api",
  timeout: 10000,
});

// Agregar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
