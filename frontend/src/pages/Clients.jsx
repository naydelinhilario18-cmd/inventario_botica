import { useEffect, useState } from "react";
import { api, jsonBody } from "../services/api.js";

const blank = { name: "", document: "", phone: "", email: "" };

export default function Clients({ reloadKey, notify }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try { setClients(await api(`/clients?search=${encodeURIComponent(search)}`)); setError(""); }
    catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, [search, reloadKey]);

  async function save(event) {
    event.preventDefault();
    try {
      await api(editing ? `/clients/${editing}` : "/clients", {
        method: editing ? "PUT" : "POST",
        body: jsonBody({ ...form, document: form.document || null, phone: form.phone || null, email: form.email || null }),
      });
      notify(editing ? "Cliente actualizado." : "Cliente registrado.");
      setForm(blank); setEditing(null); await load();
    } catch (requestError) { setError(requestError.message); }
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">RELACIÓN CON CLIENTES</p><h1>Clientes</h1><p className="muted">Consulta y administra la información de tus clientes.</p></div></div>
      <section className="panel form-panel"><div className="panel-heading"><div><h2>{editing ? "Editar cliente" : "Registrar cliente"}</h2><p>Los datos de contacto son opcionales.</p></div></div>
        <form className="data-form client-form" onSubmit={save}>
          <label>Nombre completo<input required maxLength="160" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>DNI / Documento<input maxLength="32" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></label>
          <label>Teléfono<input type="tel" maxLength="32" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Correo electrónico<input type="email" maxLength="190" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <div className="form-actions"><button className="button primary">{editing ? "Guardar cambios" : "Registrar cliente"}</button>{editing && <button type="button" className="button secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancelar</button>}</div>
        </form>{error && <div className="form-error">{error}</div>}
      </section>
      <section className="panel"><div className="panel-heading table-title"><div><h2>Directorio de clientes</h2><p>{clients.length} resultados</p></div><input className="search-input" type="search" placeholder="Buscar cliente o documento" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="table-wrap"><table><thead><tr><th>NOMBRE</th><th>DOCUMENTO</th><th>TELÉFONO</th><th>CORREO</th><th>ACCIONES</th></tr></thead><tbody>
          {clients.map((client) => <tr key={client.id}><td className="bold">{client.name}</td><td>{client.document || "—"}</td><td>{client.phone || "—"}</td><td>{client.email || "—"}</td><td><button className="icon-button" title="Editar" onClick={() => { setEditing(client.id); setForm({ name: client.name, document: client.document ?? "", phone: client.phone ?? "", email: client.email ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>✎</button></td></tr>)}
          {!clients.length && <tr><td className="empty-cell" colSpan="5">No hay clientes para mostrar.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
