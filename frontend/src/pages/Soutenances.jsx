import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSoutenances, createSoutenance, updateSoutenance, deleteSoutenance, getPvUrl, getEtudiants, getProfesseurs, getOrganismes } from "../api/api";
import PageHeader from "../components/PageHeader";

function Soutenances() {
  const [soutenances, setSoutenances] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [organismes, setOrganismes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({ matricule: "", idorg: "", annee_univ: "", note: "", president: "", examinateur: "", rapporteur_int: "", rapporteur_ext: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { chargerTout(); }, []);
  async function chargerTout() {
    try {
      setLoading(true); setError(null);
      const [dataSoutenances, dataEtudiants, dataProfesseurs, dataOrganismes] = await Promise.all([getSoutenances(), getEtudiants(), getProfesseurs(), getOrganismes()]);
      setSoutenances(dataSoutenances); setEtudiants(dataEtudiants); setProfesseurs(dataProfesseurs); setOrganismes(dataOrganismes);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      const dataToSend = { ...formData, idorg: Number(formData.idorg), note: Number(formData.note), rapporteur_ext: formData.rapporteur_ext || null };
      if (isEditing) await updateSoutenance(editingId, dataToSend); else await createSoutenance(dataToSend);
      resetForm(); chargerTout();
    } catch (err) { setError(err.message); }
  }
  function handleEdit(soutenance) {
    setFormData({ matricule: soutenance.matricule, idorg: soutenance.idorg, annee_univ: soutenance.annee_univ, note: soutenance.note, president: soutenance.president, examinateur: soutenance.examinateur, rapporteur_int: soutenance.rapporteur_int, rapporteur_ext: soutenance.rapporteur_ext || "" });
    setEditingId(soutenance.id_soutenance); setIsEditing(true); setFormulaireOuvert(true);
  }
  async function handleDelete(id) {
    if (!confirm("Supprimer cette soutenance ?")) return;
    try { setError(null); await deleteSoutenance(id); chargerTout(); } catch (err) { setError(err.message); }
  }
  function resetForm() {
    setFormData({ matricule: "", idorg: "", annee_univ: "", note: "", president: "", examinateur: "", rapporteur_int: "", rapporteur_ext: "" });
    setIsEditing(false); setEditingId(null); setFormulaireOuvert(false);
  }
  function nomProfesseur(idprof) { const prof = professeurs.find((p) => p.idprof === idprof); return prof ? `${prof.civilite} ${prof.nom}` : idprof; }
  function nomEtudiant(soutenance) {
    if (soutenance.etudiant_nom) return `${soutenance.matricule} - ${soutenance.etudiant_nom} ${soutenance.etudiant_prenoms ?? ""}`.trim();
    const etudiant = etudiants.find((e) => e.matricule === soutenance.matricule);
    return etudiant ? `${etudiant.matricule} - ${etudiant.nom} ${etudiant.prenoms}` : soutenance.matricule;
  }
  function nomOrganisme(soutenance) {
    if (soutenance.organisme) return soutenance.organisme;
    const organisme = organismes.find((o) => String(o.idorg) === String(soutenance.idorg));
    return organisme ? organisme.design : soutenance.idorg;
  }

  const professeurOptions = (placeholder) => <><option value="">{placeholder}</option>{professeurs.map((p) => <option key={p.idprof} value={p.idprof}>{p.civilite} {p.nom} - {p.grade}</option>)}</>;
  return <div className="soutenances-page">
    <PageHeader title="Soutenances" description="Planifiez les soutenances, composez le jury et conservez les résultats." instruction="Vérifiez les membres du jury et la note avant d'enregistrer la soutenance." actions={<button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>} />
    {error && <p style={{ color: "red" }}>{error}</p>}
    <section className="student-form-section">
      <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}><span>{isEditing ? "Modifier la soutenance" : "Ajouter une soutenance"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span></button>
      {formulaireOuvert && <form className="soutenance-form" onSubmit={handleSubmit}>
        <select name="matricule" value={formData.matricule} onChange={handleChange} required><option value="">-- Choisir étudiant --</option>{etudiants.map((e) => <option key={e.matricule} value={e.matricule}>{e.matricule} - {e.nom} {e.prenoms}</option>)}</select>
        <select name="idorg" value={formData.idorg} onChange={handleChange} required><option value="">-- Choisir organisme --</option>{organismes.map((o) => <option key={o.idorg} value={o.idorg}>{o.design}</option>)}</select>
        <input name="annee_univ" placeholder="Année universitaire (ex: 2023-2024)" value={formData.annee_univ} onChange={handleChange} required />
        <input name="note" type="number" min="0" max="20" placeholder="Note /20" value={formData.note} onChange={handleChange} required />
        <select name="president" value={formData.president} onChange={handleChange} required>{professeurOptions("-- Président --")}</select>
        <select name="examinateur" value={formData.examinateur} onChange={handleChange} required>{professeurOptions("-- Examinateur --")}</select>
        <select name="rapporteur_int" value={formData.rapporteur_int} onChange={handleChange} required>{professeurOptions("-- Rapporteur interne --")}</select>
        <select name="rapporteur_ext" value={formData.rapporteur_ext} onChange={handleChange}>{professeurOptions("-- Aucun rapporteur externe --")}</select>
        <div className="student-form-actions"><button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button><button type="button" onClick={resetForm}>Annuler</button></div>
      </form>}
    </section>
    <section className="soutenance-list-section"><div className="section-heading"><div><p className="section-kicker">Planification</p><h3>Liste des soutenances</h3></div><p><strong>{soutenances.length}</strong> soutenance{soutenances.length > 1 ? "s" : ""}</p></div>
      {loading ? <p className="loading-state">Chargement des soutenances…</p> : <table><colgroup><col style={{ width: "16%" }} /><col style={{ width: "12%" }} /><col style={{ width: "8%" }} /><col style={{ width: "6%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} /><col style={{ width: "8%" }} /><col style={{ width: "160px" }} /></colgroup><thead><tr><th>Étudiant</th><th>Organisme</th><th>Année</th><th>Note</th><th>Président</th><th>Examinateur</th><th>Rapporteur int.</th><th>Rapporteur ext.</th><th className="student-actions-heading">Actions</th></tr></thead><tbody>{soutenances.length === 0 ? <tr><td colSpan="9" className="student-no-result">Aucune soutenance enregistrée.</td></tr> : soutenances.map((s) => <tr key={s.id_soutenance}><td>{nomEtudiant(s)}</td><td>{nomOrganisme(s)}</td><td>{s.annee_univ}</td><td>{s.note}/20</td><td>{nomProfesseur(s.president)}</td><td>{nomProfesseur(s.examinateur)}</td><td>{nomProfesseur(s.rapporteur_int)}</td><td>{s.rapporteur_ext ? nomProfesseur(s.rapporteur_ext) : "-"}</td><td className="student-actions"><button className="icon-button" type="button" onClick={() => handleEdit(s)} aria-label="Modifier la soutenance" data-tooltip="Modifier">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(s.id_soutenance)} aria-label="Supprimer la soutenance" data-tooltip="Supprimer">⌫</button><a className="icon-button" href={getPvUrl(s.id_soutenance)} target="_blank" rel="noreferrer" aria-label="Ouvrir le procès-verbal PDF" data-tooltip="Ouvrir le PDF">▤</a><Link className="icon-button" to={`/soutenances/${s.id_soutenance}/pv`} aria-label="Voir les détails" data-tooltip="Voir les détails">◉</Link></td></tr>)}</tbody></table>}
    </section>
  </div>;
}
export default Soutenances;
