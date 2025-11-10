import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRegister } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({ username: "", nombre: "", email: "", telefono: "", password: "" });
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authRegister(form);
      nav("/login");
    } catch (error) {
      setErr(error.response?.data?.message || error.message || "Error en registro");
    }
  };

  return (
    <div className="auth-container">
      <h2>Registro</h2>
      <form onSubmit={submit}>
        <input name="username" placeholder="Usuario" onChange={handleChange} required />
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Registrar</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
    </div>
  );
}
