import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Alerts from "./pages/Alerts.jsx";
import Clients from "./pages/Clients.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Products from "./pages/Products.jsx";
import Reports from "./pages/Reports.jsx";
import Sales from "./pages/Sales.jsx";
import Users from "./pages/Users.jsx";
import { api } from "./services/api.js";

const pageTitles = {
  dashboard: "Panel",
  products: "Inventario",
  sales: "Ventas",
  clients: "Clientes",
  alerts: "Alertas",
  reports: "Reportes",
  users: "Usuarios",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(localStorage.getItem("nova-token")));
  const [page, setPage] = useState("dashboard");
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("nova-token")) return;
    api("/auth/me")
      .then((result) => setUser(result.user))
      .catch(() => localStorage.removeItem("nova-token"))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    const expire = () => { setUser(null); setChecking(false); };
    window.addEventListener("nova-session-expired", expire);
    return () => window.removeEventListener("nova-session-expired", expire);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function notify(message) {
    setToast(message);
    setReloadKey((key) => key + 1);
  }

  function logout() {
    localStorage.removeItem("nova-token");
    setUser(null);
    setPage("dashboard");
  }

  if (checking) return <main className="loading-screen">Cargando Nova Salud...</main>;
  if (!user) return <Login onLogin={setUser} />;

  let content;
  switch (page) {
    case "products": content = <Products reloadKey={reloadKey} notify={notify} />; break;
    case "sales": content = <Sales reloadKey={reloadKey} notify={notify} />; break;
    case "clients": content = <Clients reloadKey={reloadKey} notify={notify} />; break;
    case "alerts": content = <Alerts reloadKey={reloadKey} setPage={setPage} />; break;
    case "reports": content = <Reports reloadKey={reloadKey} />; break;
    case "users": content = user.role === "admin" ? <Users reloadKey={reloadKey} notify={notify} /> : <Dashboard reloadKey={reloadKey} setPage={setPage} />; break;
    default: content = <Dashboard reloadKey={reloadKey} setPage={setPage} />;
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Nova Salud <span>/</span> <strong>{pageTitles[page]}</strong></div><div className="topbar-right"><span className="online-dot" /> Sistema operativo <span className="topbar-divider" /><span className="topbar-date">{new Intl.DateTimeFormat("es-PE", { dateStyle: "full" }).format(new Date())}</span></div></header>
        <div className="content">{content}</div>
      </main>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
