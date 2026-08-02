import { useState } from "react";
import { useAuth } from "../components/AuthContext";

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    try { setSubmitting(true); setError(""); await login({ username, password }); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  return <main className="login-page"><section className="login-card" aria-labelledby="login-title"><p className="page-eyebrow">Gestion des soutenances</p><h1 id="login-title">Connexion</h1><p>Connectez-vous pour accéder à l’espace de gestion.</p><form onSubmit={submit} className="login-form"><label>Nom d’utilisateur<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required autoFocus /></label><div className="password-field"><label>Mot de passe<input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label className="password-visibility"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Afficher le mot de passe</label></div>{error && <p className="login-error" role="alert">{error}</p>}<button type="submit" disabled={submitting}>{submitting ? "Connexion…" : "Se connecter"}</button></form></section></main>;
}

export default Login;
