import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { authLogin } from "../services/authService";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await authLogin(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      // redirect según role/adminType
      if (user.role === "JUGADOR") nav("/reservas");
      else if (user.adminType === "SUCURSAL") nav("/canchas");
      else nav("/");
    } catch (error) {
      setErr(error.response?.data?.message || error.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit}>
        <input placeholder="Usuario o email" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
    </div>
  );
}
