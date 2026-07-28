import { useState, useEffect } from "react";
import {
  getProfesseurs,
  createProfesseur,
  updateProfesseur,
  deleteProfesseur,
} from "../api/api";
import { CIVILITES, GRADES } from "../utils/constants";
import PageHeader from "../components/PageHeader";

function Professeurs() {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [gradeFiltre, setGradeFiltre] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({ idprof: "", nom: "", prenoms: "", civilite: "Mr", grade: GRADES[0] });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { chargerProfesseurs(); }, []);

  async function chargerProfesseurs() {
    try {
      setLoading(true);
      setError(null);
      setProfesseurs(await getProfesseurs());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      const dataToSend = {
        idprof: formData.idprof.trim(), nom: formData.nom.trim(), prenoms: formData.prenoms.trim(),
        civilite: formData.civilite, grade: formData.grade,
      };
      if (isEditing) await updateProfesseur(formData.idprof, dataToSend);
      else await createProfesseur(dataToSend);
      resetForm();
      chargerProfesseurs();
    } catch (err) { setError(err.message); }
  }

  function handleEdit(professeur) {
    setFormData(professeur);
    setIsEditing(true);
    setFormulaireOuvert(true);
  }

  async function handleDelete(idprof) {
    if (!confirm("Supprimer ce professeur ?")) return;
    try {
      setError(null);
      await deleteProfesseur(idprof);
      chargerProfesseurs();
    } catch (err) { setError(err.message); }
  }

  function resetForm() {
    setFormData({ idprof: "", nom: "", prenoms: "", civilite: "Mr", grade: GRADES[0] });
    setIsEditing(false);
    setFormulaireOuvert(false);
  }

  const terme = recherche.trim().toLocaleLowerCase();
  const professeursFiltres = professeurs.filter((professeur) =>
    (!terme || [professeur.idprof, professeur.nom, professeur.prenoms].some((valeur) => String(valeur ?? "").toLocaleLowerCase().includes(terme))) &&
    (!gradeFiltre || professeur.grade === gradeFiltre)
  );

  function initiales(professeur) {
    return `${professeur.nom?.[0] ?? ""}${professeur.prenoms?.[0] ?? ""}`.toUpperCase();
  }

  return (
    <div className="professeurs-page">
      <PageHeader
        title="Professeurs"
        description="Gérez les membres du corps enseignant mobilisables dans les jurys."
        instruction="Recherchez un professeur ou filtrez par grade avant de modifier son dossier."
        actions={<button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="professor-filters">
        <label className="student-search-input">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Rechercher par ID ou nom..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        </label>
        <select value={gradeFiltre} onChange={(e) => setGradeFiltre(e.target.value)} aria-label="Filtrer par grade">
          <option value="">Tous les grades</option>
          {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
        </select>
      </div>

      <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}>
          <span>{isEditing ? "Modifier le professeur" : "Ajouter un professeur"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span>
        </button>
        {formulaireOuvert && (
          <form className="student-form" onSubmit={handleSubmit}>
            <input name="idprof" placeholder="ID professeur" value={formData.idprof} onChange={handleChange} disabled={isEditing} required />
            <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
            <input name="prenoms" placeholder="Prénoms" value={formData.prenoms} onChange={handleChange} required />
            <select name="civilite" value={formData.civilite} onChange={handleChange}>{CIVILITES.map((civilite) => <option key={civilite} value={civilite}>{civilite}</option>)}</select>
            <select name="grade" value={formData.grade} onChange={handleChange}>{GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select>
            <div className="student-form-actions"><button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button><button type="button" onClick={resetForm}>Annuler</button></div>
          </form>
        )}
      </section>

      <section className="professor-list-section" aria-labelledby="professor-list-title">
        <div className="section-heading">
          <div><p className="section-kicker">Répertoire</p><h3 id="professor-list-title">Liste des professeurs</h3></div>
          <p><strong>{professeursFiltres.length}</strong> résultat{professeursFiltres.length > 1 ? "s" : ""}</p>
        </div>
        {loading ? <p className="loading-state">Chargement des professeurs…</p> : (
          <table>
            <colgroup><col style={{ width: "12%" }} /><col style={{ width: "26%" }} /><col style={{ width: "12%" }} /><col style={{ width: "38%" }} /><col style={{ width: "12%" }} /></colgroup>
            <thead><tr><th>ID</th><th>Professeur</th><th>Civilité</th><th>Grade</th><th className="student-actions-heading">Actions</th></tr></thead>
            <tbody>
              {professeursFiltres.length === 0 ? <tr><td colSpan="5" className="student-no-result">Aucun professeur ne correspond aux filtres sélectionnés.</td></tr> : professeursFiltres.map((p) => (
                <tr key={p.idprof}>
                  <td>{p.idprof}</td>
                  <td><div className="student-identity"><span className="student-avatar">{initiales(p)}</span><span>{p.nom} {p.prenoms}</span></div></td>
                  <td>{p.civilite}</td><td>{p.grade}</td>
                  <td className="student-actions">
                    <button className="icon-button" type="button" onClick={() => handleEdit(p)} aria-label={`Modifier ${p.nom} ${p.prenoms}`} data-tooltip="Modifier">✎</button>
                    <button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(p.idprof)} aria-label={`Supprimer ${p.nom} ${p.prenoms}`} data-tooltip="Supprimer">⌫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Professeurs;
