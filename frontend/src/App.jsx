import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Etudiants from "./pages/Etudiants";
import Professeurs from "./pages/Professeurs";
import Organismes from "./pages/Organismes";
import Soutenances from "./pages/Soutenances";
import ProcesVerbal from "./pages/ProcesVerbal";
import EffectifsNiveau from "./pages/EffectifsNiveau";
import EtudiantsNonSoutenus from "./pages/EtudiantsNonSoutenus";
import NotesParPeriode from "./pages/NotesParPeriode";
import Etablissement from "./pages/Etablissement";
import Utilisateurs from "./pages/Utilisateurs";
import Login from "./pages/Login";
import Profil from "./pages/Profil";
import JournalActivite from "./pages/JournalActivite";
import { FeedbackLayer } from "./components/Feedback";
import { EtablissementProvider } from "./components/EtablissementContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { notify } from "./components/Feedback";

const accessiblePages = [
  ["/etudiants", "etudiants", "voir"], ["/professeurs", "professeurs", "voir"], ["/organismes", "organismes", "voir"],
  ["/soutenances", "soutenances", "voir"], ["/effectifs", "effectifs", "voir"], ["/non-soutenus", "non_soutenus", "voir"], ["/notes", "notes", "voir"],
];

function PermissionRoute({ resource, action = "voir", children }) {
  const { can } = useAuth();
  const allowed = can(resource, action);
  useEffect(() => { if (!allowed) notify("Vous n’avez pas le droit d’accéder à cette page.", "error"); }, [allowed]);
  if (allowed) return children;
  const fallback = accessiblePages.find(([, pageResource, pageAction]) => can(pageResource, pageAction))?.[0] ?? "/profil";
  return <Navigate to={fallback} replace />;
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem("table-density") === "compact");
  const { user, loading } = useAuth();

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => { localStorage.setItem("table-density", compactMode ? "compact" : "comfortable"); }, [compactMode]);

  if (loading) return <div className="app-loading" role="status">Chargement…</div>;
  if (!user) return <Login />;

  return (
      <EtablissementProvider>
      <div className={`app-shell ${compactMode ? "density-compact" : ""}`}>
        <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} compactMode={compactMode} onToggleDensity={() => setCompactMode((value) => !value)} />
        <main className="app-main">
        <Routes>
          <Route path="/" element={<PermissionRoute resource="etudiants"><Navigate to="/etudiants" replace /></PermissionRoute>} />
          <Route path="/etudiants" element={<PermissionRoute resource="etudiants"><Etudiants /></PermissionRoute>} />
          <Route path="/professeurs" element={<PermissionRoute resource="professeurs"><Professeurs /></PermissionRoute>} />
          <Route path="/organismes" element={<PermissionRoute resource="organismes"><Organismes /></PermissionRoute>} />
          <Route path="/soutenances" element={<PermissionRoute resource="soutenances"><Soutenances /></PermissionRoute>} />
          <Route path="/soutenances/:id/pv" element={<PermissionRoute resource="soutenances"><ProcesVerbal /></PermissionRoute>} />
          <Route path="/effectifs" element={<PermissionRoute resource="effectifs"><EffectifsNiveau /></PermissionRoute>} />
          <Route path="/non-soutenus" element={<PermissionRoute resource="non_soutenus"><EtudiantsNonSoutenus /></PermissionRoute>} />
          <Route path="/notes" element={<PermissionRoute resource="notes"><NotesParPeriode /></PermissionRoute>} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/etablissement" element={<PermissionRoute resource="etablissement"><Etablissement /></PermissionRoute>} />
          <Route path="/utilisateurs" element={<PermissionRoute resource="utilisateurs"><Utilisateurs /></PermissionRoute>} />
          <Route path="/journal-activite" element={<PermissionRoute resource="journal_activite"><JournalActivite /></PermissionRoute>} />
        </Routes>
        </main>
        <FeedbackLayer />
      </div>
      </EtablissementProvider>
  );
}

function App() {
  return <BrowserRouter><AuthProvider><AppContent /></AuthProvider></BrowserRouter>;
}

export default App;
