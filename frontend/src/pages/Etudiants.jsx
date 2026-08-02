import { useState, useEffect, useMemo } from "react";
import {
  getEtudiants,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
  rechercherEtudiants,
} from "../api/api";
import { NIVEAUX, PARCOURS } from "../utils/constants";
import PageHeader from "../components/PageHeader";
import TableActionIcon from "../components/TableActionIcon";
import { confirmAction, notify } from "../components/Feedback";
import TablePagination from "../components/TablePagination";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthContext";

function Etudiants() {
  const { can } = useAuth();
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [niveauFiltre, setNiveauFiltre] = useState("");
  const [parcoursFiltre, setParcoursFiltre] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({
    matricule: "", nom: "", prenoms: "", niveau: "L1", parcours: "GB", adr_email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("nom");

  useEffect(() => { chargerEtudiants(); }, []);

  async function chargerEtudiants() {
    try {
      setLoading(true);
      setError(null);
      setEtudiants(await getEtudiants());
    } catch (err) { setError(err.message); notify(err.message, "error"); } finally { setLoading(false); }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) { chargerEtudiants(); return; }
    try {
      setLoading(true);
      setError(null);
      setEtudiants(await rechercherEtudiants(search.trim()));
    } catch (err) { setError(err.message); notify(err.message, "error"); } finally { setLoading(false); }
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
      notify(isEditing ? "Le dossier étudiant a été mis à jour." : "L'étudiant a été ajouté.");
      resetForm();
      chargerEtudiants();
    } catch (err) { setError(err.message); notify(err.message, "error"); }
  }

  function handleEdit(etudiant) {
    setFormData(etudiant);
    setIsEditing(true);
    setFormulaireOuvert(true);
  }

  async function handleDelete(matricule) {
    if (!await confirmAction({ title: "Supprimer cet étudiant ?", message: "Cette action est définitive et retirera le dossier de la liste." })) return;
    try {
      setError(null);
      await deleteEtudiant(matricule);
      notify("L'étudiant a été supprimé.");
      chargerEtudiants();
    } catch (err) { setError(err.message); notify(err.message, "error"); }
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
  const etudiantsTries = useMemo(() => [...etudiantsFiltres].sort((a, b) =>
    String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "fr", { sensitivity: "base" })
  ), [etudiantsFiltres, sortKey]);
  const pageSize = 8;
  const etudiantsPage = etudiantsTries.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, niveauFiltre, parcoursFiltre, sortKey]);

  function initiales(etudiant) {
    return `${etudiant.nom?.[0] ?? ""}${etudiant.prenoms?.[0] ?? ""}`.toUpperCase();
  }

  return (
    <div className="etudiants-page">
      <PageHeader
        title="Étudiants"
        description="Centralisez les dossiers étudiants et retrouvez rapidement une fiche."
        instruction="Utilisez les filtres pour affiner la liste, puis ouvrez le formulaire pour créer ou modifier un dossier."
        actions={can("etudiants", "ajouter") && <button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>}
      />

      <form className="student-search-form" onSubmit={handleSearch}>
        <label className="student-search-input">
          <span aria-hidden="true">⌕</span>
          <input type="search" aria-label="Rechercher par matricule ou nom" placeholder="Rechercher par matricule ou nom..." value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {(can("etudiants", "ajouter") || can("etudiants", "modifier")) && <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}>
          <span>{isEditing ? "Modifier l'étudiant" : "Ajouter un étudiant"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span>
        </button>
        {formulaireOuvert && (
          <form className="student-form" onSubmit={handleSubmit}>
            <label className="form-field"><span>Matricule <b>*</b></span><input name="matricule" value={formData.matricule} onChange={handleChange} disabled={isEditing} required minLength="2" /></label>
            <label className="form-field"><span>Nom <b>*</b></span><input name="nom" value={formData.nom} onChange={handleChange} required minLength="2" /></label>
            <label className="form-field"><span>Prénoms <b>*</b></span><input name="prenoms" value={formData.prenoms} onChange={handleChange} required minLength="2" /></label>
            <label className="form-field"><span>Niveau <b>*</b></span><select name="niveau" value={formData.niveau} onChange={handleChange} required>{NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <label className="form-field"><span>Parcours <b>*</b></span><select name="parcours" value={formData.parcours} onChange={handleChange} required>{PARCOURS.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
            <label className="form-field"><span>Email <em>optionnel</em></span><input name="adr_email" type="email" value={formData.adr_email} onChange={handleChange} /></label>
            <div className="student-form-actions">
              <button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button>
              <button type="button" onClick={resetForm}>Annuler</button>
            </div>
          </form>
        )}
      </section>}

      <section className="student-list-section" aria-labelledby="student-list-title">
        <div className="section-heading">
          <div><p className="section-kicker">Répertoire</p><h3 id="student-list-title">Liste des étudiants</h3></div>
          <div className="table-heading-actions"><label>Trier par <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}><option value="nom">Nom</option><option value="matricule">Matricule</option><option value="niveau">Niveau</option><option value="parcours">Parcours</option></select></label><p><strong>{etudiantsFiltres.length}</strong> résultat{etudiantsFiltres.length > 1 ? "s" : ""}</p></div>
        </div>
        {loading ? <LoadingSkeleton /> : (
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
              {etudiantsFiltres.length === 0 ? <tr><td colSpan="6"><EmptyState title="Aucun étudiant trouvé" description="Modifiez les filtres ou créez un premier dossier étudiant." action={can("etudiants", "ajouter") && <button type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>Ajouter un étudiant</button>} /></td></tr> : etudiantsPage.map((e) => (
                <tr key={e.matricule}>
                  <td data-label="Matricule">{e.matricule}</td>
                  <td data-label="Étudiant"><div className="student-identity"><span className="student-avatar">{initiales(e)}</span><span>{e.nom} {e.prenoms}</span></div></td>
                  <td data-label="Niveau"><span className={`level-badge level-${String(e.niveau).toLowerCase()}`}>{e.niveau}</span></td>
                  <td data-label="Parcours"><span className={`parcours-badge parcours-${String(e.parcours).toLowerCase()}`}>{e.parcours}</span></td><td data-label="Email">{e.adr_email}</td>
                  <td data-label="Actions" className="student-actions">
                    {can("etudiants", "modifier") && <button className="icon-button icon-button-edit" type="button" onClick={() => handleEdit(e)} aria-label={`Modifier ${e.nom} ${e.prenoms}`} data-tooltip="Modifier"><TableActionIcon type="edit" /></button>}
                    {can("etudiants", "supprimer") && <button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(e.matricule)} aria-label={`Supprimer ${e.nom} ${e.prenoms}`} data-tooltip="Supprimer"><TableActionIcon type="delete" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && <TablePagination page={page} totalItems={etudiantsFiltres.length} pageSize={pageSize} onPageChange={setPage} />}
      </section>
    </div>
  );
}

export default Etudiants;
