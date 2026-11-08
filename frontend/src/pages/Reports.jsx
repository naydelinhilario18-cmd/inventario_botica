import { useEffect, useState } from "react";
import { api, money } from "../services/api.js";

export default function Reports({ reloadKey }) {
  const [days, setDays] = useState(7);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/reports?days=${days}`).then((data) => { setReport(data); setError(""); })
      .catch((requestError) => setError(requestError.message));
  }, [days, reloadKey]);

  const totalRevenue = report?.daily.reduce((total, row) => total + Number(row.revenue), 0) ?? 0;
  const totalSales = report?.daily.reduce((total, row) => total + Number(row.sales), 0) ?? 0;

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">RESULTADOS DEL NEGOCIO</p><h1>Reportes</h1><p className="muted">Revisa las ventas y productos más vendidos.</p></div><select className="period-select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option></select></div>
      {error && <div className="notice error">{error}</div>}
      {report && <>
        <section className="stats-grid report-stats">
          <article className="stat-card"><div className="stat-icon blue">↗</div><div className="stat-copy"><span>Ventas del periodo</span><strong>{totalSales}</strong><small>Transacciones registradas</small></div></article>
          <article className="stat-card"><div className="stat-icon green">S/</div><div className="stat-copy"><span>Ingresos del periodo</span><strong>{money(totalRevenue)}</strong><small>Venta bruta registrada</small></div></article>
        </section>
        <section className="dashboard-grid">
          <article className="panel"><div className="panel-heading"><div><h2>Ventas por día</h2><p>Resumen del periodo seleccionado</p></div></div>
            <div className="table-wrap"><table><thead><tr><th>FECHA</th><th>VENTAS</th><th className="align-right">INGRESOS</th></tr></thead><tbody>{report.daily.map((row) => <tr key={row.day}><td>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${row.day}T00:00:00Z`))}</td><td>{row.sales}</td><td className="align-right bold">{money(row.revenue)}</td></tr>)}{!report.daily.length && <tr><td className="empty-cell" colSpan="3">No hay ventas en este periodo.</td></tr>}</tbody></table></div>
          </article>
          <article className="panel"><div className="panel-heading"><div><h2>Productos más vendidos</h2><p>Ordenados por unidades vendidas</p></div></div>
            <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>UNIDADES</th><th className="align-right">INGRESOS</th></tr></thead><tbody>{report.topProducts.map((item) => <tr key={item.name}><td className="bold">{item.name}</td><td>{item.quantity}</td><td className="align-right">{money(item.revenue)}</td></tr>)}{!report.topProducts.length && <tr><td className="empty-cell" colSpan="3">Aún no hay productos vendidos.</td></tr>}</tbody></table></div>
          </article>
        </section>
      </>}
    </>
  );
}
