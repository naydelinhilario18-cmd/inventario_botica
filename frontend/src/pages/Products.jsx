import { useEffect, useState } from "react";
import { api, jsonBody, money } from "../services/api.js";

const emptyForm = { name: "", category: "Medicamentos", sku: "", price: "", stock: 0, min_stock: 5, expiration_date: "" };

export default function Products({ reloadKey, notify }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try { setProducts(await api(`/products?search=${encodeURIComponent(search)}`)); setError(""); }
    catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, [search, reloadKey]);

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      await api(editing ? `/products/${editing}` : "/products", {
        method: editing ? "PUT" : "POST",
        body: jsonBody({ ...form, price: Number(form.price), stock: Number(form.stock), min_stock: Number(form.min_stock), expiration_date: form.expiration_date || null }),
      });
      notify(editing ? "Producto actualizado." : "Producto registrado.");
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (requestError) { setError(requestError.message); }
  }

  function edit(product) {
    setEditing(product.id);
    setForm({ name: product.name, category: product.category, sku: product.sku, price: product.price, stock: product.stock, min_stock: product.min_stock, expiration_date: product.expiration_date ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(product) {
    if (!window.confirm(`¿Eliminar el producto "${product.name}"?`)) return;
    try { await api(`/products/${product.id}`, { method: "DELETE" }); notify("Producto eliminado."); await load(); }
    catch (requestError) { setError(requestError.message); }
  }

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">CATÁLOGO Y EXISTENCIAS</p><h1>Inventario</h1><p className="muted">Administra tus productos y niveles de stock.</p></div></div>
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>{editing ? "Editar producto" : "Agregar producto"}</h2><p>Completa la información del producto</p></div></div>
        <form className="data-form product-form" onSubmit={save}>
          <label>Nombre del producto<input required maxLength="160" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej. Paracetamol 500 mg" /></label>
          <label>Categoría<input required maxLength="100" value={form.category} onChange={(e) => update("category", e.target.value)} /></label>
          <label>SKU / Código<input required maxLength="64" value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="MED-001" /></label>
          <label>Precio (S/)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} /></label>
          <label>Existencias<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => update("stock", e.target.value)} /></label>
          <label>Stock mínimo<input required type="number" min="0" step="1" value={form.min_stock} onChange={(e) => update("min_stock", e.target.value)} /></label>
          <label>Vencimiento<input type="date" value={form.expiration_date ?? ""} onChange={(e) => update("expiration_date", e.target.value)} /></label>
          <div className="form-actions"><button className="button primary">{editing ? "Guardar cambios" : "Agregar producto"}</button>{editing && <button className="button secondary" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancelar</button>}</div>
        </form>
        {error && <div className="form-error">{error}</div>}
      </section>
      <section className="panel">
        <div className="panel-heading table-title"><div><h2>Productos</h2><p>{products.length} resultados</p></div><input className="search-input" type="search" placeholder="Buscar por nombre, SKU o categoría" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>SKU</th><th>CATEGORÍA</th><th>PRECIO</th><th>STOCK</th><th>VENCIMIENTO</th><th>ACCIONES</th></tr></thead><tbody>
          {products.map((product) => <tr key={product.id}><td className="bold">{product.name}</td><td>{product.sku}</td><td>{product.category}</td><td>{money(product.price)}</td><td><span className={`badge ${product.stock <= product.min_stock ? "warning" : "success"}`}>{product.stock} uds.</span></td><td>{product.expiration_date || "—"}</td><td className="actions"><button className="icon-button" title="Editar" onClick={() => edit(product)}>✎</button><button className="icon-button danger-text" title="Eliminar" onClick={() => remove(product)}>×</button></td></tr>)}
          {!products.length && <tr><td className="empty-cell" colSpan="7">No hay productos para mostrar.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
