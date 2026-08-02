import { useEffect, useMemo, useState } from "react";
import { createUtilisateur, getPermissions, getUtilisateurPermissions, getUtilisateurs, updateUtilisateur, updateUtilisateurPermissions } from "../api/api";
import PageHeader from "../components/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { notify } from "../components/Feedback";

const blank = { username: "", email: "", nom: "", password: "", role: "utilisateur", actif: true };
const restrictedCodes = new Set(["etablissement.modifier", "utilisateurs.voir", "utilisateurs.ajouter", "utilisateurs.modifier", "journal_activite.voir"]);

function Utilisateurs() {
  const [users, setUsers] = useState([]); const [permissions, setPermissions] = useState([]); const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true); const [permissionsLoading, setPermissionsLoading] = useState(false); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const load = () => { setLoading(true); Promise.all([getUtilisateurs(), getPermissions()]).then(([loadedUsers, loadedPermissions]) => { setUsers(loadedUsers); setPermissions(loadedPermissions); }).catch((error) => notify(error.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []);
  const groupedPermissions = useMemo(() => permissions.reduce((groups, permission) => ({ ...groups, [permission.resource]: [...(groups[permission.resource] ?? []), permission] }), {}), [permissions]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  async function edit(user) {
    setEditing(user.id); setForm({ username: user.username, email: user.email, nom: user.nom, password: "", role: user.role, actif: Boolean(Number(user.actif)) }); setSelectedIds([]);
    if (user.role !== "utilisateur") return;
    try { setPermissionsLoading(true); setSelectedIds((await getUtilisateurPermissions(user.id)).map((permission) => permission.id)); } catch (error) { notify(error.message, "error"); } finally { setPermissionsLoading(false); }
  }
  function togglePermission(permissionId) { setSelectedIds((current) => current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId]); }
  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        const updated = await updateUtilisateur(editing, form);
        if (updated.role === "utilisateur") await updateUtilisateurPermissions(editing, selectedIds);
      } else await createUtilisateur(form);
      notify(editing ? "Utilisateur et droits mis à jour." : "Utilisateur créé. Configurez ensuite ses droits d’accès."); setForm(blank); setEditing(null); setSelectedIds([]); load();
    } catch (error) { notify(error.message, "error"); } finally { setSaving(false); }
  }
  return <div><PageHeader title="Utilisateurs" description="Créez, gérez les comptes et attribuez les droits d’accès." instruction="Les administrateurs possèdent toujours tous les droits. Les droits métier se règlent compte par compte." />
    <form onSubmit={submit} className="user-form"><h3>{editing ? "Modifier l’utilisateur" : "Nouvel utilisateur"}</h3>
      <label className="form-field"><span>Nom complet</span><input name="nom" value={form.nom} onChange={change} required maxLength="150" /></label>
      <label className="form-field"><span>Nom d’utilisateur</span><input name="username" value={form.username} onChange={change} required pattern="[A-Za-z0-9_.-]{3,50}" maxLength="50" /></label>
      <label className="form-field"><span>Email</span><input name="email" type="email" value={form.email} onChange={change} required maxLength="150" /></label>
      <div className="form-field"><span>{editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}</span><input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={change} required={!editing} minLength="12" /><em>12 caractères, majuscule, minuscule et chiffre.</em><label className="password-visibility"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Afficher le mot de passe</label></div>
      <label className="form-field"><span>Rôle</span><select name="role" value={form.role} onChange={change}><option value="utilisateur">Utilisateur</option><option value="admin">Administrateur</option></select></label><label className="user-active"><input name="actif" type="checkbox" checked={form.actif} onChange={change} /> Compte actif</label>
      {editing && form.role === "utilisateur" && <fieldset className="permission-fieldset" aria-busy={permissionsLoading}><legend>Droits d’accès</legend><p>Choisissez les actions autorisées pour cet utilisateur.</p>{permissionsLoading ? <span role="status">Chargement des droits…</span> : Object.entries(groupedPermissions).map(([resource, entries]) => <div className="permission-group" key={resource}><h4>{resource.replaceAll("_", " ")}</h4>{entries.filter((permission) => !restrictedCodes.has(permission.code)).map((permission) => <label key={permission.id}><input type="checkbox" checked={selectedIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} /> {permission.action[0].toUpperCase() + permission.action.slice(1)}</label>)}{entries.some((permission) => restrictedCodes.has(permission.code)) && <small>Les droits de gestion des utilisateurs, du journal et de modification de l’établissement sont réservés aux administrateurs.</small>}</div>)}</fieldset>}
      {editing && form.role === "admin" && <p className="permission-admin-note">Cet administrateur possède tous les droits automatiquement ; aucune permission spécifique n’est nécessaire.</p>}
      <div className="etablissement-actions"><button type="submit" disabled={saving || permissionsLoading}>{saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer l’utilisateur"}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(blank); setSelectedIds([]); }}>Annuler</button>}</div>
    </form>{loading ? <LoadingSkeleton rows={5} /> : <section className="user-list"><table><thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.nom}<small>@{user.username}</small></td><td>{user.email}</td><td><span className="status-badge">{user.role}</span></td><td>{Number(user.actif) ? "Actif" : "Désactivé"}</td><td><button type="button" className="icon-button icon-button-edit" onClick={() => edit(user)} aria-label={`Modifier ${user.username}`}>Modifier</button></td></tr>)}</tbody></table></section>}</div>;
}

export default Utilisateurs;
