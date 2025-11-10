import api from "../api/api";
import jwt_decode from "jwt-decode";

export const authLogin = async (usernameOrEmail, password) => {
  const res = await api.post("/auth/login", { username: usernameOrEmail, password });
  // backend debe devolver { token, user }
  const { token, user } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return { token, user };
};

export const authRegister = async (payload) => {
  const res = await api.post("/usuarios", payload); // si tu endpoint es otro, cambiar
  return res.data;
};

export const authLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
