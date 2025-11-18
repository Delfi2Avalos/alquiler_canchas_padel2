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
  // 👇 OJO: acá TAMPOCO va /api
  const res = await api.post("/auth/login", { username, password });

  const body = res.data || {};
  const payloadRes = body.data || body;

  if (!payloadRes?.token) {
    throw new Error("Respuesta inválida del servidor (sin token)");
  }

  localStorage.setItem("token", payloadRes.token);

  const decoded = jwtDecode(payloadRes.token);

  const user =
    payloadRes.user || {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
      sucursal: decoded.sucursal ?? null,
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
