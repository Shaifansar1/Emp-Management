import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login({ token: data.token, user: data.user });
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-form">
        <h2>Login</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className="login-button auth-btn">
          Login
        </button>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
