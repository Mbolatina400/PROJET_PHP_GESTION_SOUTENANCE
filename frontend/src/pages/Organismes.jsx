import { useState, useEffect } from "react";
import { getOrganismes, createOrganisme, updateOrganisme, deleteOrganisme } from "../api/api";
import PageHeader from "../components/PageHeader";

function Organismes() {
  const [organismes, setOrganismes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [formData, setFormData] = useState({ idorg: "", design: "", lieu: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { chargerOrganismes(); }, []);

  async function chargerOrganismes() {
    try { setLoading(true); setError(null); setOrganismes(await getOrganismes()); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(null);
      if (isEditing) await updateOrganisme(formData.idorg, formData);
      else { const { idorg, ...dataSansId } = formData; await createOrganisme(dataSansId); }
      resetForm(); chargerOrganismes();
    } catch (err) { setError(err.message); }
  }
  function handleEdit(organisme) { setFormData(organisme); setIsEditing(true); setFormulaireOuvert(true); }
  async function handleDelete(idorg) {
    if (!confirm("Supprimer cet organisme ?")) return;
    try { setError(null); await deleteOrganisme(idorg); chargerOrganismes(); } catch (err) { setError(err.message); }
  }
  function resetForm() { setFormData({ idorg: "", design: "", lieu: "" }); setIsEditing(false); setFormulaireOuvert(false); }

  const terme = recherche.trim().toLocaleLowerCase();
  const organismesFiltres = organismes.filter((organisme) =>
    !terme || [organisme.design, organisme.lieu].some((valeur) => String(valeur ?? "").toLocaleLowerCase().includes(terme))
  );

  return (
    <div className="organismes-page">
      <PageHeader title="Organismes d'accueil" description="Répertoriez les structures qui accueillent les étudiants en stage ou en projet." instruction="Recherchez un organisme avant de l'ajouter afin d'éviter les doublons." actions={<button className="header-add-button" type="button" onClick={() => { setIsEditing(false); setFormulaireOuvert(true); }}>+ Ajouter</button>} />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label className="single-search student-search-input"><span aria-hidden="true">⌕</span><input type="search" placeholder="Rechercher par désignation ou lieu..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></label>

      <section className="student-form-section">
        <button className="student-form-toggle" type="button" aria-expanded={formulaireOuvert} onClick={() => setFormulaireOuvert(!formulaireOuvert)}><span>{isEditing ? "Modifier l'organisme" : "Ajouter un organisme"}</span><span className="toggle-chevron" aria-hidden="true">⌄</span></button>
        {formulaireOuvert && <form className="student-form organisme-form" onSubmit={handleSubmit}>
          <input name="design" placeholder="Désignation" value={formData.design} onChange={handleChange} required />
          <input name="lieu" placeholder="Lieu" value={formData.lieu} onChange={handleChange} required />
          <div className="student-form-actions"><button type="submit">{isEditing ? "Enregistrer" : "Ajouter"}</button><button type="button" onClick={resetForm}>Annuler</button></div>
        </form>}
      </section>

      <section className="organisme-list-section" aria-labelledby="organisme-list-title">
        <div className="section-heading"><div><p className="section-kicker">Répertoire</p><h3 id="organisme-list-title">Liste des organismes</h3></div><p><strong>{organismesFiltres.length}</strong> résultat{organismesFiltres.length > 1 ? "s" : ""}</p></div>
        {loading ? <p className="loading-state">Chargement des organismes…</p> : <table>
          <colgroup><col style={{ width: "12%" }} /><col style={{ width: "48%" }} /><col style={{ width: "28%" }} /><col style={{ width: "12%" }} /></colgroup>
          <thead><tr><th>ID</th><th>Désignation</th><th>Lieu</th><th className="student-actions-heading">Actions</th></tr></thead>
          <tbody>{organismesFiltres.length === 0 ? <tr><td colSpan="4" className="student-no-result">Aucun organisme ne correspond à votre recherche.</td></tr> : organismesFiltres.map((o) => <tr key={o.idorg}><td>{o.idorg}</td><td>{o.design}</td><td>{o.lieu}</td><td className="student-actions"><button className="icon-button" type="button" onClick={() => handleEdit(o)} aria-label={`Modifier ${o.design}`} data-tooltip="Modifier">✎</button><button className="icon-button icon-button-danger" type="button" onClick={() => handleDelete(o.idorg)} aria-label={`Supprimer ${o.design}`} data-tooltip="Supprimer">⌫</button></td></tr>)}</tbody>
        </table>}
      </section>
    </div>
  );
}

export default Organismes;
