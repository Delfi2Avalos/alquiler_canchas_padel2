import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(form);
      login(user);
      navigate("/");
    } catch {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="col-md-4 offset-md-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="text-center mb-3">Iniciar Sesión</h4>
          <form onSubmit={handleSubmit}>
            <input className="form-control mb-2" type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-3" type="password" placeholder="Contraseña" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn btn-primary w-100" type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
