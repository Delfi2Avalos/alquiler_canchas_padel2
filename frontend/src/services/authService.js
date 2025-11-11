import api from "../api/api";
import { jwtDecode } from "jwt-decode";

export async function register(payload) {
  // payload = { nombre, dni, username, email, telefono, password }
  const { data } = await api.post("/auth/register", payload);
  // El backend devuelve { id_usuario, username, email, token }
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
}

export async function login({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });
  if (data?.token) localStorage.setItem("token", data.token);
  return { ...data, decoded: jwtDecode(data.token) };
}

export function logout() {
  localStorage.removeItem("token");
}
