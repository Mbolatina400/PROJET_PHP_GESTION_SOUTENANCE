import { useState, useEffect, useMemo } from "react";
import {
  getProfesseurs,
  createProfesseur,
  updateProfesseur,
  deleteProfesseur,
} from "../api/api";
import { CIVILITES, GRADES } from "../utils/constants";
import PageHeader from "../components/PageHeader";
import TableActionIcon from "../components/TableActionIcon";
import { confirmAction, notify } from "../components/Feedback";
import TablePagination from "../components/TablePagination";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthContext";

function Professeurs() {
  const { can } = useAuth();
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [gradeFiltre, setGradeFiltre] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({ idprof: "", nom: "", prenoms: "", civilite: "Mr", grade: GRADES[0] });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("nom");

  useEffect(() => { chargerProfesseurs(); }, []);

  async function chargerProfesseurs() {
    try {
      setLoading(true);
      setError(null);
      setProfesseurs(await getProfesseurs());
    } catch (err) { setError(err.message); notify(err.message, "error"); } finally { setLoading(false); }
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
      notify(isEditing ? "Le professeur a été mis à jour." : "Le professeur a été ajouté.");
      resetForm();
      chargerProfesseurs();
    } catch (err) { setError(err.message); notify(err.message, "error"); }
  }

  function handleEdit(professeur) {
    setFormData(professeur);
    setIsEditing(true);
    setFormulaireOuvert(true);
  }

  async function handleDelete(idprof) {
    if (!await confirmAction({ title: "Supprimer ce professeur ?", message: "Cette action est définitive et retirera le professeur des jurys disponibles." })) return;
    try {
      setError(null);
      await deleteProfesseur(idprof);
      notify("Le professeur a été supprimé.");
      chargerProfesseurs();
    } catch (err) { setError(err.message); notify(err.message, "error"); }
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
  const professeursTries = useMemo(() => [...professeursFiltres].sort((a, b) =>
    String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "fr", { sensitivity: "base" })
  ), [professeursFiltres, sortKey]);
  const pageSize = 8;
  const professeursPage = professeursTries.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [recherche, gradeFiltre, sortKey]);

  function initiales(professeur) {
    return `${professeur.nom?.[0] ?? ""}${professeur.prenoms?.[0] ?? ""}`.toUpperCase();
  }

  return (
    <div className="professeurs-page">
      <PageHeader
        title="Professeurs"
        description="Gérez les membres du corps enseignant mobilisables dans les jurys."
        instruction="Recherchez un professeur ou filtrez par grade avant de modifier son dossier."
        actions={can("professeurs", "ajouter") && <button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>}
      />

      <div className="professor-filters">
        <label className="student-search-input">
          <span aria-hidden="true">⌕</span>
          <input type="search" aria-label="Rechercher par identifiant ou nom" placeholder="Rechercher par ID ou nom..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        </label>
        <select value={gradeFiltre} onChange={(e) => setGradeFiltre(e.target.value)} aria-label="Filtrer par grade">
          <option value="">Tous les grades</option>
          {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
        </select>
      </div>

      {(can("professeurs", "ajouter") || can("professeurs", "modifier")) && <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}>
          <span>{isEditing ? "Modifier le professeur" : "Ajouter un professeur"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span>
        </button>
        {formulaireOuvert && (
          <form className="student-form" onSubmit={handleSubmit}>
            <label className="form-field"><span>ID professeur <b>*</b></span><input name="idprof" value={formData.idprof} onChange={handleChange} disabled={isEditing} required minLength="2" /></label>
            <label className="form-field"><span>Nom <b>*</b></span><input name="nom" value={formData.nom} onChange={handleChange} required minLength="2" /></label>
            <label className="form-field"><span>Prénoms <b>*</b></span><input name="prenoms" value={formData.prenoms} onChange={handleChange} required minLength="2" /></label>
            <label className="form-field"><span>Civilité <b>*</b></span><select name="civilite" value={formData.civilite} onChange={handleChange} required>{CIVILITES.map((civilite) => <option key={civilite} value={civilite}>{civilite}</option>)}</select></label>
            <label className="form-field"><span>Grade <b>*</b></span><select name="grade" value={formData.grade} onChange={handleChange} required>{GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></label>
            <div className="student-form-actions"><button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button><button type="button" onClick={resetForm}>Annuler</button></div>
          </form>
        )}
      </section>}

      <section className="professor-list-section" aria-labelledby="professor-list-title">
        <div className="section-heading">
          <div><p className="section-kicker">Répertoire</p><h3 id="professor-list-title">Liste des professeurs</h3></div>
          <div className="table-heading-actions"><label>Trier par <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}><option value="nom">Nom</option><option value="idprof">Identifiant</option><option value="grade">Grade</option></select></label><p><strong>{professeursFiltres.length}</strong> résultat{professeursFiltres.length > 1 ? "s" : ""}</p></div>
        </div>
        {loading ? <LoadingSkeleton /> : (
          <table>
            <colgroup><col style={{ width: "12%" }} /><col style={{ width: "26%" }} /><col style={{ width: "12%" }} /><col style={{ width: "38%" }} /><col style={{ width: "12%" }} /></colgroup>
            <thead><tr><th>ID</th><th>Professeur</th><th>Civilité</th><th>Grade</th><th className="student-actions-heading">Actions</th></tr></thead>
            <tbody>
              {professeursFiltres.length === 0 ? <tr><td colSpan="5"><EmptyState title="Aucun professeur trouvé" description="Essayez un autre filtre ou ajoutez un professeur au répertoire." action={can("professeurs", "ajouter") && <button type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>Ajouter un professeur</button>} /></td></tr> : professeursPage.map((p) => (
                <tr key={p.idprof}>
                  <td data-label="Identifiant">{p.idprof}</td>
                  <td data-label="Professeur"><div className="student-identity"><span className="student-avatar">{initiales(p)}</span><span>{p.nom} {p.prenoms}</span></div></td>
                  <td data-label="Civilité">{p.civilite}</td><td data-label="Grade">{p.grade}</td>
                  <td data-label="Actions" className="student-actions">
                    {can("professeurs", "modifier") && <button className="icon-button icon-button-edit" type="button" onClick={() => handleEdit(p)} aria-label={`Modifier ${p.nom} ${p.prenoms}`} data-tooltip="Modifier"><TableActionIcon type="edit" /></button>}
                    {can("professeurs", "supprimer") && <button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(p.idprof)} aria-label={`Supprimer ${p.nom} ${p.prenoms}`} data-tooltip="Supprimer"><TableActionIcon type="delete" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && <TablePagination page={page} totalItems={professeursFiltres.length} pageSize={pageSize} onPageChange={setPage} />}
      </section>
    </div>
  );
}

export default Professeurs;
