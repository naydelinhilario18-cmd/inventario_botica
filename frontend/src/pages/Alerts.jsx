import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Alerts({ reloadKey, setPage }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/alerts").then(setProducts).catch((requestError) => setError(requestError.message));
  }, [reloadKey]);

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">SEGUIMIENTO AUTOMÁTICO</p><h1>Alertas</h1><p className="muted">Productos con stock bajo o próximos a vencer.</p></div><button className="button primary" onClick={() => setPage("products")}>Administrar inventario</button></div>
      {error && <div className="notice error">{error}</div>}
      <section className="panel"><div className="panel-heading"><div><h2>Productos que requieren atención</h2><p>{products.length} alertas activas · vencimiento dentro de los próximos 30 días</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>SKU</th><th>CATEGORÍA</th><th>EXISTENCIAS</th><th>MÍNIMO</th><th>VENCIMIENTO</th><th>ESTADO</th></tr></thead><tbody>
          {products.map((product) => {
            const low = product.stock <= product.min_stock;
            return <tr key={product.id}><td className="bold">{product.name}</td><td>{product.sku}</td><td>{product.category}</td><td>{product.stock}</td><td>{product.min_stock}</td><td>{product.expiration_date || "—"}</td><td><span className={`badge ${low ? "warning" : "info"}`}>{low ? "Stock bajo" : "Próximo a vencer"}</span></td></tr>;
          })}
          {!products.length && !error && <tr><td className="empty-cell" colSpan="7">Todo en orden: no hay alertas activas.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
