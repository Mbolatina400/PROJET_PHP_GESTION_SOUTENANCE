import { NavLink } from "react-router-dom";
import { useState } from "react";
import { getEtablissementLogoUrl } from "../api/api";
import { useEtablissement } from "./EtablissementContext";
import { useAuth } from "./AuthContext";

function NavIcon({ name }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    students: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    teachers: <><path d="M4 19.5V9.4L12 5l8 4.4v10.1" /><path d="M2 10.5 12 16l10-5.5M12 16v5" /><path d="M8 13.8v4M16 13.8v4" /></>,
    building: <><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h2a2 2 0 0 1 2 2v10" /><path d="M8 7h2M8 11h2M8 15h2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    chart: <><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    grades: <><path d="M4 19V5M4 19h16" /><path d="M8 16v-4M12 16V8M16 16V5" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2 2-.06-.06A1.65 1.65 0 0 0 16 18.4a1.65 1.65 0 0 0-1 1.51V20h-3v-.09A1.65 1.65 0 0 0 11 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06-2-2 .06-.06A1.65 1.65 0 0 0 7.6 15a1.65 1.65 0 0 0-1.51-1H6v-3h.09A1.65 1.65 0 0 0 7.6 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2-2 .06.06A1.65 1.65 0 0 0 11 6.6h.01A1.65 1.65 0 0 0 12 5.09V5h3v.09A1.65 1.65 0 0 0 16 6.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 2 2-.06.06A1.65 1.65 0 0 0 19.4 10v.01A1.65 1.65 0 0 0 20.91 11H21v3h-.09A1.65 1.65 0 0 0 19.4 15Z" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function SoutenanceLogo() {
  return (
    <svg width="27" height="27" viewBox="0 0 32 32" fill="none" aria-label="Logo Gestion des soutenances" role="img">
      <path d="m3.5 12.1 12.5-6 12.5 6-12.5 6-12.5-6Z" fill="currentColor" />
      <path d="M8 15.1v6.1c4.9 3.7 11.1 3.7 16 0v-6.1l-8 3.8-8-3.8Z" fill="currentColor" opacity=".78" />
      <path d="M27 13v7.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="27" cy="21.7" r="1.7" fill="#FCD34D" />
    </svg>
  );
}

function Navbar({ darkMode, onToggleTheme, compactMode, onToggleDensity }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { etablissement } = useEtablissement();
  const { user, can, logout } = useAuth();
  const links = [
    ...(can("etudiants", "voir") ? [{ to: "/etudiants", icon: "students", tone: "sky", label: "Étudiants" }] : []),
    ...(can("professeurs", "voir") ? [{ to: "/professeurs", icon: "teachers", tone: "violet", label: "Professeurs" }] : []),
    ...(can("organismes", "voir") ? [{ to: "/organismes", icon: "building", tone: "amber", label: "Organismes" }] : []),
    ...(can("soutenances", "voir") ? [{ to: "/soutenances", icon: "calendar", tone: "rose", label: "Soutenances" }] : []),
    ...(can("effectifs", "voir") ? [{ to: "/effectifs", icon: "chart", tone: "emerald", label: "Effectifs" }] : []),
    ...(can("non_soutenus", "voir") ? [{ to: "/non-soutenus", icon: "clock", tone: "orange", label: "Non soutenus" }] : []),
    ...(can("notes", "voir") ? [{ to: "/notes", icon: "grades", tone: "indigo", label: "Notes par période" }] : []),
    { to: "/profil", icon: "profile", tone: "sky", label: "Mon profil" },
    ...(can("etablissement", "voir") ? [{ to: "/etablissement", icon: "settings", tone: "sky", label: "Établissement" }] : []),
    ...(can("utilisateurs", "voir") ? [{ to: "/utilisateurs", icon: "students", tone: "violet", label: "Utilisateurs" }] : []),
    ...(can("journal_activite", "voir") ? [{ to: "/journal-activite", icon: "clock", tone: "amber", label: "Journal d’activité" }] : []),
  ];

  return (
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">{etablissement?.logo_path ? <img src={`${getEtablissementLogoUrl()}?v=${etablissement.logo_path}`} alt="" /> : <SoutenanceLogo />}</span>
        <div>
          <h2>{etablissement?.sigle || etablissement?.nom || "Gestion Soutenances"}</h2>
          <p>{etablissement?.faculte || "Administration"}</p>
        </div>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir ou fermer le menu" aria-expanded={menuOpen}>
          <span /> <span /> <span />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
            <span className={`nav-icon ${link.tone}`}><NavIcon name={link.icon} /></span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2v3M17 2v3M3 9h18" />
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 14h8M8 17h5" />
          </svg>
        </div>
        <div>
          <span>{etablissement?.ville || "Année universitaire"}</span>
          <strong>{etablissement?.telephone || "Session en cours"}</strong>
        </div>
        <span className="sidebar-status" title="Système actif" aria-label="Système actif" />
      </div>
      <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-pressed={darkMode} aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}>
        <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
        {darkMode ? "Mode clair" : "Mode sombre"}
      </button>
      <button className="theme-toggle density-toggle" type="button" onClick={onToggleDensity} aria-pressed={compactMode}>
        <span aria-hidden="true">↕</span>{compactMode ? "Vue confortable" : "Vue compacte"}
      </button>
      <div className="sidebar-user"><span>{user?.nom || user?.username}</span><small>{user?.role === "admin" ? "Administrateur" : "Utilisateur"}</small><button type="button" onClick={logout}>Déconnexion</button></div>
    </aside>
  );
}

export default Navbar;
