import axios from "axios";

// URL base de la API
// La idea es SIEMPRE usar VITE_API_URL en el .env del front
// Ejemplo: VITE_API_URL=http://192.168.1.39:3001
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
