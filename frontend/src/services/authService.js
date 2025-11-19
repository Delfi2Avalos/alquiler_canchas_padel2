import api from "../api";
import { jwtDecode } from "jwt-decode";

// REGISTRO
// payload = { nombre, dni, username, email, telefono, password }
export async function register(payload) {
 
  const res = await api.post("/auth/register", payload);

  const body = res.data || {};
  const payloadRes = body.data || body;

  if (payloadRes?.token) {
    localStorage.setItem("token", payloadRes.token);
  }

  return payloadRes;
}

// LOGIN
// Devuelve { token, user, decoded }
export async function login({ username, password }) {
  const res = await api.post("/auth/login", { username, password });

  const body = res.data || {};
  const payloadRes = body.data || body;

  if (!payloadRes?.token) {
    throw new Error("Respuesta inválida del servidor (sin token)");
  }

  localStorage.setItem("token", payloadRes.token);

  const decoded = jwtDecode(payloadRes.token);

  const userFromApi = payloadRes.user || {};

  // 🔹 Normalizamos SIEMPRE el rol a "role" y MAYÚSCULAS
  const normalizedRole = (
    userFromApi.role ||
    userFromApi.rol ||        // por si el back manda "rol"
    decoded.role ||           // por si viene en el token
    decoded.rol ||            // idem
    ""
  ).toUpperCase();

  const user = {
    id: userFromApi.id ?? decoded.id,
    username: userFromApi.username ?? decoded.username,
    sucursal: userFromApi.sucursal ?? decoded.sucursal ?? null,
    ...userFromApi,          // mantenemos otros campos (dni, nombre, etc.)
    role: normalizedRole,   
  };

  return {
    token: payloadRes.token,
    user,
    decoded,
  };
}

// LOGOUT
export function logout() {
  localStorage.removeItem("token");
}
