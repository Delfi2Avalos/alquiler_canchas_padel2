import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch {
      alert("Error al registrar usuario");
    }
  };

  return (
    <div className="col-md-4 offset-md-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="text-center mb-3">Registro</h4>
          <form onSubmit={handleSubmit}>
            <input className="form-control mb-2" placeholder="Nombre" onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="form-control mb-2" type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-3" type="password" placeholder="Contraseña" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn btn-success w-100" type="submit">Crear Cuenta</button>
          </form>
        </div>
      </div>
    </div>
  );
}
