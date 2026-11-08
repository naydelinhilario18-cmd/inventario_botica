import { useEffect, useState } from "react";
import { api, jsonBody } from "../services/api.js";

export default function Users({ reloadKey, notify }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [error, setError] = useState("");

  async function load() {
    try { setUsers(await api("/auth/users")); setError(""); }
    catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, [reloadKey]);

  async function create(event) {
    event.preventDefault();
    try {
      await api("/auth/users", { method: "POST", body: jsonBody(form) });
      notify("Usuario creado.");
      setForm({ name: "", email: "", password: "", role: "staff" });
      await load();
    } catch (requestError) { setError(requestError.message); }
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">ACCESO AL SISTEMA</p><h1>Usuarios</h1><p className="muted">Administra las cuentas que pueden ingresar a Nova Salud.</p></div></div>
      <section className="panel form-panel"><div className="panel-heading"><div><h2>Crear usuario</h2><p>El usuario podrá iniciar sesión con su correo y contraseña.</p></div></div>
        <form className="data-form user-form" onSubmit={create}>
          <label>Nombre completo<input required maxLength="120" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Correo electrónico<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Contraseña inicial<input required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label>Rol<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="staff">Personal</option><option value="admin">Administrador</option></select></label>
          <div className="form-actions"><button className="button primary">Crear usuario</button></div>
        </form>{error && <div className="form-error">{error}</div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Usuarios del sistema</h2><p>{users.length} cuentas</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>NOMBRE</th><th>CORREO</th><th>ROL</th><th>REGISTRO</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="bold">{user.name}</td><td>{user.email}</td><td><span className="badge info">{user.role === "admin" ? "Administrador" : "Personal"}</span></td><td>{new Date(user.created_at).toLocaleDateString("es-PE")}</td></tr>)}{!users.length && <tr><td className="empty-cell" colSpan="4">No hay usuarios.</td></tr>}</tbody></table></div>
      </section>
    </>
  );
}
