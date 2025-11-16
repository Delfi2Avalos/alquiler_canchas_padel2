import api from "../api";
import { jwtDecode } from "jwt-decode";

// REGISTRO
// payload = { nombre, dni, username, email, telefono, password }
export async function register(payload) {
  const res = await api.post("/auth/register", payload);

  // El backend puede responder como:
  // { ok: true, data: { id_usuario, username, email, token } }
  // o directo { id_usuario, username, email, token }
  const body = res.data || {};
  const payloadRes = body.data || body;

  if (payloadRes?.token) {
    localStorage.setItem("token", payloadRes.token);
  }

  // Devolvemos solo los datos útiles
  return payloadRes;
}

// LOGIN
// Devuelve { token, user, decoded }
export async function login({ username, password }) {
  const res = await api.post("/auth/login", { username, password });

  // El backend (con utils/http.ok) suele responder:
  // { ok: true, data: { token, user } }
  const body = res.data || {};
  const payloadRes = body.data || body;

  if (!payloadRes?.token) {
    throw new Error("Respuesta inválida del servidor (sin token)");
  }

  // Guardar token
  localStorage.setItem("token", payloadRes.token);

  // Decodificar JWT por si querés usarlo
  const decoded = jwtDecode(payloadRes.token);

  // Asegurar que haya user (por si en algún momento viene solo en el token)
  const user =
    payloadRes.user ||
    {
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
