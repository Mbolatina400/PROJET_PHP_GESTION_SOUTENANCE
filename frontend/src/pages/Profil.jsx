import { useState } from "react";
import { changePassword } from "../api/api";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Feedback";

function Profil() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirmation: "" });
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    if (form.new_password !== form.confirmation) { notify("La confirmation du mot de passe ne correspond pas.", "error"); return; }
    try { setSaving(true); await changePassword(form); setForm({ current_password: "", new_password: "", confirmation: "" }); notify("Votre mot de passe a été mis à jour."); } catch (error) { notify(error.message, "error"); } finally { setSaving(false); }
  }
  return <div><PageHeader title="Mon profil" description="Modifiez votre mot de passe de connexion." instruction="Utilisez au moins 12 caractères, avec une majuscule, une minuscule et un chiffre." /><form onSubmit={submit} className="profile-form"><div className="form-field"><span>Mot de passe actuel</span><input name="current_password" type={showPasswords ? "text" : "password"} value={form.current_password} onChange={change} autoComplete="current-password" required /></div><div className="form-field"><span>Nouveau mot de passe</span><input name="new_password" type={showPasswords ? "text" : "password"} value={form.new_password} onChange={change} autoComplete="new-password" minLength="12" required /></div><div className="form-field"><span>Confirmer le nouveau mot de passe</span><input name="confirmation" type={showPasswords ? "text" : "password"} value={form.confirmation} onChange={change} autoComplete="new-password" minLength="12" required /></div><label className="password-visibility"><input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} /> Afficher les mots de passe</label><div className="etablissement-actions"><button type="submit" disabled={saving}>{saving ? "Mise à jour…" : "Mettre à jour le mot de passe"}</button></div></form></div>;
}

export default Profil;
