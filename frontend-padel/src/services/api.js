// src/services/api.js
import axios from 'axios';

// Leemos la URL base desde el archivo .env
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api` // Asumiendo que tu API usa /api (ej: /api/login)
});

// (Opcional pero recomendado) 
// Aquí podés interceptar las peticiones para agregar el Token de autenticación
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;