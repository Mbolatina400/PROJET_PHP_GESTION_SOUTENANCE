import { useEffect, useState } from "react";
import { deleteLogoEtablissement, getEtablissement, getEtablissementLogoUrl, updateEtablissement, uploadLogoEtablissement } from "../api/api";
import PageHeader from "../components/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { confirmAction, notify } from "../components/Feedback";
import { useEtablissement } from "../components/EtablissementContext";
import { useAuth } from "../components/AuthContext";

const emptyForm = { nom: "", sigle: "", faculte: "", adresse: "", ville: "", telephone: "", email: "", site_web: "", logo_path: null };

function Etablissement() {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [logoVersion, setLogoVersion] = useState(Date.now());
  const { refreshEtablissement } = useEtablissement();
  const { can } = useAuth();
  const canEdit = can("etablissement", "modifier");

  useEffect(() => {
    getEtablissement().then((data) => setFormData({ ...emptyForm, ...data })).catch((error) => { setLoadError(error.message); notify(error.message, "error"); }).finally(() => setLoading(false));
  }, []);

  function changeField(event) { setFormData((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function save(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const data = await updateEtablissement(formData);
      setFormData({ ...emptyForm, ...data });
      await refreshEtablissement();
      notify("Les informations de l'établissement ont été enregistrées.");
    } catch (error) { notify(error.message, "error"); } finally { setSaving(false); }
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLogoSaving(true);
      const data = await uploadLogoEtablissement(file);
      setFormData({ ...emptyForm, ...data });
      setLogoVersion(Date.now());
      await refreshEtablissement();
      notify("Le logo a été importé.");
    } catch (error) { notify(error.message, "error"); } finally { setLogoSaving(false); event.target.value = ""; }
  }

  async function deleteLogo() {
    const confirmed = await confirmAction({ title: "Supprimer le logo ?", message: "Le logo ne sera plus affiché dans l’application ni sur les procès-verbaux.", confirmLabel: "Supprimer le logo" });
    if (!confirmed) return;
    try {
      setLogoSaving(true);
      const data = await deleteLogoEtablissement();
      setFormData({ ...emptyForm, ...data });
      setLogoVersion(Date.now());
      await refreshEtablissement();
      notify("Le logo a été supprimé.");
    } catch (error) { notify(error.message, "error"); } finally { setLogoSaving(false); }
  }

  return <div className="etablissement-page">
    <PageHeader title="Établissement" description="Configurez les informations affichées dans l'application et sur les procès-verbaux PDF." instruction="Enregistrez les informations avant d'importer le logo. Les champs marqués d'un astérisque sont obligatoires." />
    {loading ? <LoadingSkeleton rows={7} /> : loadError ? <section className="etablissement-status" role="alert"><h2>Configuration indisponible</h2><p>{loadError}</p><p>Vérifiez la connexion à la base puis appliquez <code>backend/database/migrations/001_create_etablissement.sql</code> si la table n’existe pas encore.</p></section> : <>
    {!formData.is_configured && <section className="etablissement-status" role="status"><h2>Configuration à initialiser</h2><p>Enregistrez au minimum le nom de l’établissement. Vous pourrez ensuite importer son logo.</p></section>}
    <section className="etablissement-preview" aria-labelledby="etablissement-preview-title">
      <div className="etablissement-preview-brand">{formData.logo_path ? <img src={`${getEtablissementLogoUrl()}?v=${logoVersion}`} alt="" /> : <span aria-hidden="true">{(formData.sigle || formData.nom || "ÉT").slice(0, 2).toUpperCase()}</span>}</div>
      <div><p className="section-kicker">Aperçu dans l'application</p><h3 id="etablissement-preview-title">{formData.nom || "Nom de l'établissement"}</h3><p>{[formData.faculte, formData.adresse, formData.ville].filter(Boolean).join(" · ") || "Les coordonnées seront affichées ici après enregistrement."}</p></div>
      <div className="etablissement-preview-contact">{formData.email && <span>{formData.email}</span>}{formData.telephone && <span>{formData.telephone}</span>}{formData.site_web && <span>{formData.site_web}</span>}</div>
    </section>
    <form className="etablissement-form" onSubmit={save}>
      <section className="etablissement-logo-panel" aria-label="Logo de l'établissement">
        <div className="logo-preview">{formData.logo_path ? <img src={`${getEtablissementLogoUrl()}?v=${logoVersion}`} alt={`Logo ${formData.nom || "de l'établissement"}`} /> : <span aria-hidden="true">{(formData.sigle || formData.nom || "ÉT").slice(0, 2).toUpperCase()}</span>}</div>
        <div><h3>Logo de l'établissement</h3><p>PNG, JPEG ou WebP, jusqu'à 2 Mo.</p>{canEdit && <div className="logo-actions"><label className={`logo-upload ${(!formData.is_configured || logoSaving) ? "is-disabled" : ""}`}>{formData.logo_path ? "Remplacer le logo" : "Importer un logo"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!formData.is_configured || logoSaving} onChange={uploadLogo} /></label>{formData.logo_path && <button className="logo-delete" type="button" onClick={deleteLogo} disabled={logoSaving}>Supprimer le logo</button>}</div>}</div>
      </section>
      <div className="form-field"><span>Nom de l'établissement <b>*</b></span><input name="nom" value={formData.nom} onChange={changeField} disabled={!canEdit} required maxLength="180" /></div>
      <div className="form-field"><span>Sigle</span><input name="sigle" value={formData.sigle} onChange={changeField} disabled={!canEdit} maxLength="30" placeholder="Ex. UTM" /></div>
      <div className="form-field"><span>Faculté / département</span><input name="faculte" value={formData.faculte} onChange={changeField} disabled={!canEdit} maxLength="180" /></div>
      <div className="form-field"><span>Ville</span><input name="ville" value={formData.ville} onChange={changeField} disabled={!canEdit} maxLength="100" /></div>
      <div className="form-field form-field-wide"><span>Adresse</span><input name="adresse" value={formData.adresse} onChange={changeField} disabled={!canEdit} maxLength="255" /></div>
      <div className="form-field"><span>Téléphone</span><input name="telephone" value={formData.telephone} onChange={changeField} disabled={!canEdit} maxLength="50" inputMode="tel" pattern="\+?[0-9 .()/-]+" title="Utilisez des chiffres et les séparateurs +, espace, ., (, ), / ou -" /></div>
      <div className="form-field"><span>Email</span><input name="email" type="email" value={formData.email} onChange={changeField} disabled={!canEdit} maxLength="150" /></div>
      <div className="form-field"><span>Site web</span><input name="site_web" type="url" value={formData.site_web} onChange={changeField} disabled={!canEdit} maxLength="180" placeholder="https://…" pattern="https?://.+" title="Saisissez une URL HTTP ou HTTPS complète" /></div>
      {canEdit ? <div className="etablissement-actions"><button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer les informations"}</button></div> : <p className="permission-admin-note">La consultation est autorisée, mais la modification de l’établissement est réservée aux administrateurs.</p>}
    </form></>}
  </div>;
}

export default Etablissement;
