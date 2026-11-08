const links = [
  { id: "dashboard", label: "Panel", icon: "⌂" },
  { id: "products", label: "Inventario", icon: "▦" },
  { id: "sales", label: "Ventas", icon: "↗" },
  { id: "clients", label: "Clientes", icon: "♙" },
  { id: "alerts", label: "Alertas", icon: "!" },
  { id: "reports", label: "Reportes", icon: "▤" },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage("dashboard"); }}>
        <span className="brand-mark">+</span>
        <span><strong>nova salud</strong><small>BOTICA & BIENESTAR</small></span>
      </a>
      <div className="menu-caption">MENÚ PRINCIPAL</div>
      <nav className="nav-list" aria-label="Navegación principal">
        {links.map((link) => (
          <button
            className={`nav-link ${page === link.id ? "active" : ""}`}
            key={link.id}
            onClick={() => setPage(link.id)}
          >
            <span className="nav-icon">{link.icon}</span>{link.label}
          </button>
        ))}
        {user.role === "admin" && (
          <button className={`nav-link ${page === "users" ? "active" : ""}`} onClick={() => setPage("users")}>
            <span className="nav-icon">♧</span>Usuarios
          </button>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-card">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="user-details"><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrador" : "Personal"}</small></span>
          <button className="logout" title="Cerrar sesión" onClick={onLogout}>↪</button>
        </div>
      </div>
    </aside>
  );
}
