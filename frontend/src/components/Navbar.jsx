import { NavLink } from "react-router-dom";

function Navbar() {
  const links = [
    { to: "/etudiants", icon: "ET", label: "Etudiants" },
    { to: "/professeurs", icon: "PR", label: "Professeurs" },
    { to: "/organismes", icon: "OR", label: "Organismes" },
    { to: "/soutenances", icon: "SO", label: "Soutenances" },
    { to: "/effectifs", icon: "EF", label: "Effectifs" },
    { to: "/non-soutenus", icon: "NS", label: "Non soutenus" },
    { to: "/notes", icon: "NO", label: "Notes par periode" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">GS</span>
        <div>
          <h2>Gestion Soutenances</h2>
          <p>Administration</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Navbar;
