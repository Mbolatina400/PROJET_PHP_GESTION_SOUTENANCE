import { useEffect, useState } from "react";
import { getJournalActivite } from "../api/api";
import PageHeader from "../components/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import { notify } from "../components/Feedback";

function JournalActivite() {
  const [entries, setEntries] = useState(null);
  useEffect(() => { getJournalActivite().then(setEntries).catch((error) => notify(error.message, "error")); }, []);
  return <div><PageHeader title="Journal d’activité" description="Historique des actions effectuées dans l’application." instruction="Les 100 dernières actions sont affichées." />{entries === null ? <LoadingSkeleton rows={6} /> : entries.length === 0 ? <EmptyState title="Aucune activité enregistrée" description="Les nouvelles créations, modifications et suppressions apparaîtront ici." /> : <section className="user-list"><table><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Ressource</th><th>Détails</th><th>Adresse IP</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={`${entry.created_at}-${index}`}><td>{entry.created_at}</td><td>{entry.username || "Système"}</td><td>{entry.action}</td><td>{entry.chemin}</td><td>{entry.details || "—"}</td><td>{entry.adresse_ip || "—"}</td></tr>)}</tbody></table></section>}</div>;
}

export default JournalActivite;
