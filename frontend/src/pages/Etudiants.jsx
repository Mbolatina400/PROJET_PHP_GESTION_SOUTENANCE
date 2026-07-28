import { useState, useEffect } from "react";
import {
  getEtudiants,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
  rechercherEtudiants,
} from "../api/api";
import { NIVEAUX, PARCOURS } from "../utils/constants";
import PageHeader from "../components/PageHeader";

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [niveauFiltre, setNiveauFiltre] = useState("");
  const [parcoursFiltre, setParcoursFiltre] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({
    matricule: "", nom: "", prenoms: "", niveau: "L1", parcours: "GB", adr_email: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { chargerEtudiants(); }, []);

  async function chargerEtudiants() {
    try {
      setLoading(true);
      setError(null);
      setEtudiants(await getEtudiants());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) { chargerEtudiants(); return; }
    try {
      setLoading(true);
      setError(null);
      setEtudiants(await rechercherEtudiants(search.trim()));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      const dataToSend = {
        matricule: formData.matricule.trim(), nom: formData.nom.trim(), prenoms: formData.prenoms.trim(),
        niveau: formData.niveau, parcours: formData.parcours, adr_email: formData.adr_email.trim() || null,
      };
      if (isEditing) await updateEtudiant(formData.matricule, dataToSend);
      else await createEtudiant(dataToSend);
      resetForm();
      chargerEtudiants();
    } catch (err) { setError(err.message); }
  }

  function handleEdit(etudiant) {
    setFormData(etudiant);
    setIsEditing(true);
    setFormulaireOuvert(true);
  }

  async function handleDelete(matricule) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    try {
      setError(null);
      await deleteEtudiant(matricule);
      chargerEtudiants();
    } catch (err) { setError(err.message); }
  }

  function resetForm() {
    setFormData({ matricule: "", nom: "", prenoms: "", niveau: "L1", parcours: "GB", adr_email: "" });
    setIsEditing(false);
    setFormulaireOuvert(false);
  }

  const etudiantsFiltres = etudiants.filter((etudiant) =>
    (!niveauFiltre || etudiant.niveau === niveauFiltre) &&
    (!parcoursFiltre || etudiant.parcours === parcoursFiltre)
  );

  function initiales(etudiant) {
    return `${etudiant.nom?.[0] ?? ""}${etudiant.prenoms?.[0] ?? ""}`.toUpperCase();
  }

  return (
    <div className="etudiants-page">
      <PageHeader
        title="Étudiants"
        description="Centralisez les dossiers étudiants et retrouvez rapidement une fiche."
        instruction="Utilisez les filtres pour affiner la liste, puis ouvrez le formulaire pour créer ou modifier un dossier."
        actions={<button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="student-search-form" onSubmit={handleSearch}>
        <label className="student-search-input">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Rechercher par matricule ou nom..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select value={niveauFiltre} onChange={(e) => setNiveauFiltre(e.target.value)} aria-label="Filtrer par niveau">
          <option value="">Tous les niveaux</option>
          {NIVEAUX.map((niveau) => <option key={niveau} value={niveau}>{niveau}</option>)}
        </select>
        <select value={parcoursFiltre} onChange={(e) => setParcoursFiltre(e.target.value)} aria-label="Filtrer par parcours">
          <option value="">Tous les parcours</option>
          {PARCOURS.map((parcours) => <option key={parcours} value={parcours}>{parcours}</option>)}
        </select>
        <button type="submit">Rechercher</button>
      </form>

      <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}>
          <span>{isEditing ? "Modifier l'étudiant" : "Ajouter un étudiant"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span>
        </button>
        {formulaireOuvert && (
          <form className="student-form" onSubmit={handleSubmit}>
            <input name="matricule" placeholder="Matricule" value={formData.matricule} onChange={handleChange} disabled={isEditing} required />
            <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
            <input name="prenoms" placeholder="Prénoms" value={formData.prenoms} onChange={handleChange} required />
            <select name="niveau" value={formData.niveau} onChange={handleChange}>{NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}</select>
            <select name="parcours" value={formData.parcours} onChange={handleChange}>{PARCOURS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
            <input name="adr_email" type="email" placeholder="Email (optionnel)" value={formData.adr_email} onChange={handleChange} />
            <div className="student-form-actions">
              <button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button>
              <button type="button" onClick={resetForm}>Annuler</button>
            </div>
          </form>
        )}
      </section>

      <section className="student-list-section" aria-labelledby="student-list-title">
        <div className="section-heading">
          <div><p className="section-kicker">Répertoire</p><h3 id="student-list-title">Liste des étudiants</h3></div>
          <p><strong>{etudiantsFiltres.length}</strong> résultat{etudiantsFiltres.length > 1 ? "s" : ""}</p>
        </div>
        {loading ? <p className="loading-state">Chargement des étudiants…</p> : (
          <table>
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead><tr><th>Matricule</th><th>Étudiant</th><th>Niveau</th><th>Parcours</th><th>Email</th><th className="student-actions-heading">Actions</th></tr></thead>
            <tbody>
              {etudiantsFiltres.length === 0 ? <tr><td colSpan="6" className="student-no-result">Aucun étudiant ne correspond aux filtres sélectionnés.</td></tr> : etudiantsFiltres.map((e) => (
                <tr key={e.matricule}>
                  <td>{e.matricule}</td>
                  <td><div className="student-identity"><span className="student-avatar">{initiales(e)}</span><span>{e.nom} {e.prenoms}</span></div></td>
                  <td><span className="level-badge">{e.niveau}</span></td>
                  <td>{e.parcours}</td><td>{e.adr_email}</td>
                  <td className="student-actions">
                    <button className="icon-button" type="button" onClick={() => handleEdit(e)} aria-label={`Modifier ${e.nom} ${e.prenoms}`} data-tooltip="Modifier">✎</button>
                    <button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(e.matricule)} aria-label={`Supprimer ${e.nom} ${e.prenoms}`} data-tooltip="Supprimer">⌫</button>
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

export default Etudiants;
