import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "https://localhost:7021/api", // Cambia esto si tu API usa otro puerto
});

export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);
  const token = response.data.token;
  localStorage.setItem("token", token);
  return jwtDecode(token);
}

export async function registerUser(data) {
  return await api.post("/auth/register", data);
}

export function authLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
