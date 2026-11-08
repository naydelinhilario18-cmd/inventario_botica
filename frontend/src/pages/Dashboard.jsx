import { useEffect, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { api, dateTime, money } from "../services/api.js";

export default function Dashboard({ reloadKey, setPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/").then(setData).catch((requestError) => setError(requestError.message));
  }, [reloadKey]);

  if (error) return <div className="notice error">{error}</div>;
  if (!data) return <div className="loading">Cargando resumen...</div>;

  const { summary, recentSales, lowStock } = data;
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">RESUMEN GENERAL</p><h1>Hola, qué bueno verte</h1><p className="muted">Este es el estado de tu botica hoy.</p></div>
        <button className="button primary" onClick={() => setPage("sales")}>＋ Nueva venta</button>
      </div>
      <section className="stats-grid">
        <StatCard label="Productos activos" value={summary.products} note="En el inventario" icon="▦" />
        <StatCard label="Ventas de hoy" value={summary.sales_today} note={money(summary.revenue_today)} icon="↗" tone="blue" />
        <StatCard label="Clientes registrados" value={summary.clients} note="Base de clientes" icon="♙" tone="violet" />
        <StatCard label="Alertas de stock" value={summary.low_stock} note="Requieren reposición" icon="!" tone="amber" />
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading"><div><h2>Ventas recientes</h2><p>Últimos movimientos registrados</p></div><button className="text-button" onClick={() => setPage("sales")}>Ver todas →</button></div>
          {recentSales.length ? <div className="table-wrap"><table><thead><tr><th>VENTA</th><th>CLIENTE</th><th>FECHA</th><th className="align-right">TOTAL</th></tr></thead><tbody>
            {recentSales.map((sale) => <tr key={sale.id}><td className="bold">#{sale.id}</td><td>{sale.client_name}</td><td>{dateTime(sale.created_at)}</td><td className="align-right bold">{money(sale.total)}</td></tr>)}
          </tbody></table></div> : <div className="empty-state">Todavía no hay ventas registradas.</div>}
        </article>
        <article className="panel">
          <div className="panel-heading"><div><h2>Stock por reponer</h2><p>Productos en su nivel mínimo</p></div><button className="text-button" onClick={() => setPage("alerts")}>Ver alertas →</button></div>
          {lowStock.length ? <div className="low-stock-list">{lowStock.map((product) => <div className="stock-row" key={product.id}><span className="stock-product"><strong>{product.name}</strong><small>{product.sku}</small></span><span className="stock-count">{product.stock} uds.</span></div>)}</div> : <div className="empty-state">No hay productos con stock bajo.</div>}
        </article>
      </section>
    </>
  );
}
