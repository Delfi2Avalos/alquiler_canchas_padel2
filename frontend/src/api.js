import axios from "axios";

//Crear instancia de axios
  const api = axios.create({
  baseURL: "http://192.168.1.41:3001/api",
  // baseURL: "http://192.168.0.105:3001/api", //wifi facultad: Instituto Tecnologico 1
  headers: {
    "Content-Type": "application/json",
  },
});

//Interceptor: agregar token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
