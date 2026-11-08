import { useState } from "react";
import { api, jsonBody } from "../services/api.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@novasalud.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: jsonBody({ email, password }),
      });
      localStorage.setItem("nova-token", result.token);
      onLogin(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><span className="brand-mark">+</span><span><strong>nova salud</strong><small>BOTICA & BIENESTAR</small></span></div>
        <p className="eyebrow">SISTEMA DE GESTIÓN</p>
        <h1>Bienvenido</h1>
        <p className="muted">Inicia sesión para administrar tu botica.</p>
        <form className="form-stack" onSubmit={submit}>
          <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="button primary full" disabled={busy}>{busy ? "Ingresando..." : "Iniciar sesión"} <span>→</span></button>
        </form>
        <p className="login-foot">Gestión segura de inventario y ventas</p>
      </section>
    </main>
  );
}
