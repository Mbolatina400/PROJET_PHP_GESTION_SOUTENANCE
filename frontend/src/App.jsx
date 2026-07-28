import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Etudiants from "./pages/Etudiants";
import Professeurs from "./pages/Professeurs";
import Organismes from "./pages/Organismes";
import Soutenances from "./pages/Soutenances";
import ProcesVerbal from "./pages/ProcesVerbal";
import EffectifsNiveau from "./pages/EffectifsNiveau";
import EtudiantsNonSoutenus from "./pages/EtudiantsNonSoutenus";
import NotesParPeriode from "./pages/NotesParPeriode";


function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/etudiants" />} />
          <Route path="/etudiants" element={<Etudiants />} />
          <Route path="/professeurs" element={<Professeurs />} />
          <Route path="/organismes" element={<Organismes />} />
          <Route path="/soutenances" element={<Soutenances />} />
          <Route path="/soutenances/:id/pv" element={<ProcesVerbal />} />
          <Route path="/effectifs" element={<EffectifsNiveau />} />
          <Route path="/non-soutenus" element={<EtudiantsNonSoutenus />} />
          <Route path="/notes" element={<NotesParPeriode />} />
        </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
