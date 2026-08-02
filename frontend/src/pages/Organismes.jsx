import { useState, useEffect, useMemo } from "react";
import { getOrganismes, createOrganisme, updateOrganisme, deleteOrganisme } from "../api/api";
import PageHeader from "../components/PageHeader";
import TableActionIcon from "../components/TableActionIcon";
import { confirmAction, notify } from "../components/Feedback";
import TablePagination from "../components/TablePagination";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthContext";

function Organismes() {
  const { can } = useAuth();
  const [organismes, setOrganismes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({ idorg: "", design: "", lieu: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("design");

  useEffect(() => { chargerOrganismes(); }, []);

  async function chargerOrganismes() {
    try { setLoading(true); setError(null); setOrganismes(await getOrganismes()); }
    catch (err) { setError(err.message); notify(err.message, "error"); } finally { setLoading(false); }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      if (isEditing) await updateOrganisme(formData.idorg, formData);
      else { const { idorg: _idorg, ...dataSansId } = formData; await createOrganisme(dataSansId); }
      notify(isEditing ? "L'organisme a été mis à jour." : "L'organisme a été ajouté.");
      resetForm(); chargerOrganismes();
    } catch (err) { setError(err.message); notify(err.message, "error"); }
  }
  function handleEdit(organisme) { setFormData(organisme); setIsEditing(true); setFormulaireOuvert(true); }
  async function handleDelete(idorg) {
    if (!await confirmAction({ title: "Supprimer cet organisme ?", message: "Cette action est définitive et retirera l'organisme des choix disponibles." })) return;
    try { setError(null); await deleteOrganisme(idorg); notify("L'organisme a été supprimé."); chargerOrganismes(); } catch (err) { setError(err.message); notify(err.message, "error"); }
  }
  function resetForm() { setFormData({ idorg: "", design: "", lieu: "" }); setIsEditing(false); setFormulaireOuvert(false); }

  const terme = recherche.trim().toLocaleLowerCase();
  const organismesFiltres = organismes.filter((organisme) =>
    !terme || [organisme.design, organisme.lieu].some((valeur) => String(valeur ?? "").toLocaleLowerCase().includes(terme))
  );
  const organismesTries = useMemo(() => [...organismesFiltres].sort((a, b) =>
    String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "fr", { sensitivity: "base" })
  ), [organismesFiltres, sortKey]);
  const pageSize = 8;
  const organismesPage = organismesTries.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [recherche, sortKey]);

  return (
    <div className="organismes-page">
      <PageHeader title="Organismes d'accueil" description="Répertoriez les structures qui accueillent les étudiants en stage ou en projet." instruction="Recherchez un organisme avant de l'ajouter afin d'éviter les doublons." actions={can("organismes", "ajouter") && <button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>} />
      <label className="single-search student-search-input"><span aria-hidden="true">⌕</span><input type="search" aria-label="Rechercher un organisme" placeholder="Rechercher par désignation ou lieu..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></label>

      {(can("organismes", "ajouter") || can("organismes", "modifier")) && <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}><span>{isEditing ? "Modifier l'organisme" : "Ajouter un organisme"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span></button>
        {formulaireOuvert && <form className="student-form organisme-form" onSubmit={handleSubmit}>
          <label className="form-field"><span>Désignation <b>*</b></span><input name="design" value={formData.design} onChange={handleChange} required minLength="2" /></label>
          <label className="form-field"><span>Lieu <b>*</b></span><input name="lieu" value={formData.lieu} onChange={handleChange} required minLength="2" /></label>
          <div className="student-form-actions"><button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button><button type="button" onClick={resetForm}>Annuler</button></div>
        </form>}
      </section>}

      <section className="organisme-list-section" aria-labelledby="organisme-list-title">
        <div className="section-heading"><div><p className="section-kicker">Répertoire</p><h3 id="organisme-list-title">Liste des organismes</h3></div><div className="table-heading-actions"><label>Trier par <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}><option value="design">Désignation</option><option value="lieu">Lieu</option><option value="idorg">Identifiant</option></select></label><p><strong>{organismesFiltres.length}</strong> résultat{organismesFiltres.length > 1 ? "s" : ""}</p></div></div>
        {loading ? <LoadingSkeleton /> : <table>
          <colgroup><col style={{ width: "12%" }} /><col style={{ width: "48%" }} /><col style={{ width: "28%" }} /><col style={{ width: "12%" }} /></colgroup>
          <thead><tr><th>ID</th><th>Désignation</th><th>Lieu</th><th className="student-actions-heading">Actions</th></tr></thead>
          <tbody>{organismesFiltres.length === 0 ? <tr><td colSpan="4"><EmptyState title="Aucun organisme trouvé" description="Ajoutez une structure d'accueil ou modifiez votre recherche." action={can("organismes", "ajouter") && <button type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>Ajouter un organisme</button>} /></td></tr> : organismesPage.map((o) => <tr key={o.idorg}><td data-label="Identifiant">{o.idorg}</td><td data-label="Désignation">{o.design}</td><td data-label="Lieu">{o.lieu}</td><td data-label="Actions" className="student-actions">{can("organismes", "modifier") && <button className="icon-button icon-button-edit" type="button" onClick={() => handleEdit(o)} aria-label={`Modifier ${o.design}`} data-tooltip="Modifier"><TableActionIcon type="edit" /></button>}{can("organismes", "supprimer") && <button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(o.idorg)} aria-label={`Supprimer ${o.design}`} data-tooltip="Supprimer"><TableActionIcon type="delete" /></button>}</td></tr>)}</tbody>
        </table>}
        {!loading && <TablePagination page={page} totalItems={organismesFiltres.length} pageSize={pageSize} onPageChange={setPage} />}
      </section>
    </div>
  );
}

export default Organismes;
