import { useEffect, useMemo, useState } from "react";
import { api, dateTime, jsonBody, money } from "../services/api.js";

export default function Sales({ reloadKey, notify }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [productList, clientList, saleList] = await Promise.all([
        api("/products"), api("/clients"), api("/sales"),
      ]);
      setProducts(productList); setClients(clientList); setSales(saleList); setError("");
    } catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, [reloadKey]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addProduct() {
    const product = products.find((item) => item.id === Number(productId));
    const amount = Number(quantity);
    if (!product || !Number.isInteger(amount) || amount < 1) return;
    const existing = cart.find((item) => item.id === product.id);
    const nextAmount = amount + (existing?.quantity ?? 0);
    if (nextAmount > product.stock) { setError(`Stock insuficiente. Disponible: ${product.stock}.`); return; }
    setError("");
    setCart(existing
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: nextAmount } : item)
      : [...cart, { id: product.id, name: product.name, price: Number(product.price), quantity: amount, stock: product.stock }]);
    setProductId(""); setQuantity(1);
  }

  async function checkout() {
    setError("");
    try {
      const result = await api("/sales", {
        method: "POST",
        body: jsonBody({ client_id: clientId || null, items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) }),
      });
      notify(`Venta #${result.id} registrada por ${money(result.total)}.`);
      setCart([]); setClientId(""); await load();
    } catch (requestError) { setError(requestError.message); }
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">ATENCIÓN Y CAJA</p><h1>Ventas</h1><p className="muted">Registra una venta y actualiza el inventario automáticamente.</p></div></div>
      <section className="sales-grid">
        <article className="panel"><div className="panel-heading"><div><h2>Nueva venta</h2><p>Agrega los productos de la compra</p></div></div>
          <div className="sale-controls">
            <label>Cliente<select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Venta general / sin cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
            <div className="add-product-row"><label>Producto<select value={productId} onChange={(e) => setProductId(e.target.value)}><option value="">Selecciona un producto</option>{products.filter((product) => product.stock > 0).map((product) => <option key={product.id} value={product.id}>{product.name} · {money(product.price)} · {product.stock} uds.</option>)}</select></label><label className="quantity-label">Cant.<input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><button className="button secondary add-button" onClick={addProduct}>Agregar</button></div>
          </div>
          <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>CANT.</th><th>PRECIO</th><th>SUBTOTAL</th><th></th></tr></thead><tbody>
            {cart.map((item) => <tr key={item.id}><td className="bold">{item.name}</td><td>{item.quantity}</td><td>{money(item.price)}</td><td>{money(item.quantity * item.price)}</td><td><button className="icon-button danger-text" onClick={() => setCart(cart.filter((product) => product.id !== item.id))}>×</button></td></tr>)}
            {!cart.length && <tr><td className="empty-cell" colSpan="5">Agrega productos para comenzar la venta.</td></tr>}
          </tbody></table></div>
          <div className="checkout"><span>Total <strong>{money(total)}</strong></span><button className="button primary" disabled={!cart.length} onClick={checkout}>Completar venta →</button></div>
          {error && <div className="form-error">{error}</div>}
        </article>
        <aside className="panel sale-hint"><div className="tip-icon">✓</div><h2>Venta segura</h2><p>El stock se valida y descuenta automáticamente al confirmar. Los productos vendidos quedan registrados en el historial.</p></aside>
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Historial de ventas</h2><p>Últimas 200 ventas</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>N.º</th><th>FECHA</th><th>CLIENTE</th><th>VENDEDOR</th><th>PRODUCTOS</th><th className="align-right">TOTAL</th></tr></thead><tbody>
          {sales.map((sale) => <tr key={sale.id}><td className="bold">#{sale.id}</td><td>{dateTime(sale.created_at)}</td><td>{sale.client_name || "Venta general"}</td><td>{sale.seller_name}</td><td>{sale.item_count}</td><td className="align-right bold">{money(sale.total)}</td></tr>)}
          {!sales.length && <tr><td className="empty-cell" colSpan="6">Todavía no hay ventas.</td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
