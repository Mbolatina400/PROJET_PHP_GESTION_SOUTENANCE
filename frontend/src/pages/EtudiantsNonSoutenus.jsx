import { useState, useEffect } from "react";
import { getEtudiantsNonSoutenus } from "../api/api";
import PageHeader from "../components/PageHeader";

function EtudiantsNonSoutenus() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  useEffect(() => { chargerEtudiantsNonSoutenus(); }, []);
  async function chargerEtudiantsNonSoutenus() {
    try { setLoading(true); setEtudiants(await getEtudiantsNonSoutenus()); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  const terme = recherche.trim().toLocaleLowerCase();
  const etudiantsFiltres = etudiants.filter((etudiant) => !terme || [etudiant.matricule, etudiant.nom, etudiant.prenoms].some((v) => String(v ?? "").toLocaleLowerCase().includes(terme)));
  return <div className="non-soutenus-page">
    <PageHeader title="Étudiants non soutenus" description="Identifiez les étudiants dont la soutenance reste à organiser." instruction="Utilisez cette liste pour préparer les prochaines sessions de soutenance." />
    {error && <p style={{ color: "red" }}>{error}</p>}
    <label className="single-search student-search-input"><span aria-hidden="true">⌕</span><input type="search" placeholder="Rechercher par nom ou matricule..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></label>
    <section className="non-soutenus-list-section"><div className="section-heading"><div><p className="section-kicker">Suivi des soutenances</p><h3>Étudiants à programmer</h3></div><p><strong>{etudiantsFiltres.length}</strong> étudiant{etudiantsFiltres.length > 1 ? "s" : ""}</p></div>
      {loading ? <p className="loading-state">Chargement des étudiants…</p> : <table><colgroup><col style={{ width: "12%" }} /><col style={{ width: "18%" }} /><col style={{ width: "22%" }} /><col style={{ width: "10%" }} /><col style={{ width: "12%" }} /><col style={{ width: "26%" }} /></colgroup><thead><tr><th>Matricule</th><th>Nom</th><th>Prénoms</th><th>Niveau</th><th>Parcours</th><th>Email</th></tr></thead><tbody>{etudiantsFiltres.length === 0 ? <tr><td colSpan="6" className="student-no-result">{recherche ? "Aucun étudiant ne correspond à votre recherche." : "Tous les étudiants ont soutenu."}</td></tr> : etudiantsFiltres.map((e) => <tr key={e.matricule}><td>{e.matricule}</td><td>{e.nom}</td><td>{e.prenoms}</td><td><span className="level-badge">{e.niveau}</span></td><td>{e.parcours}</td><td>{e.adr_email}</td></tr>)}</tbody></table>}
    </section>
  </div>;
}
export default EtudiantsNonSoutenus;
