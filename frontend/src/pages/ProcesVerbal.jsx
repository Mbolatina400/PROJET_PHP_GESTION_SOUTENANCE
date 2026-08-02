import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import {
  getSoutenance,
  getPvUrl,
} from "../api/api";
import PageHeader from "../components/PageHeader";

function ProcesVerbal() {
  const { id } = useParams();
  const { can } = useAuth();

  const [soutenance, setSoutenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerDetails();
  }, [id]);

  async function chargerDetails() {
    try {
      setLoading(true);
      setError(null);

      const dataSoutenance = await getSoutenance(id);
      setSoutenance(dataSoutenance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!soutenance) return <p>Soutenance introuvable.</p>;

  return (
    <div>
      <nav className="breadcrumbs" aria-label="Fil d'Ariane"><Link to="/soutenances">Soutenances</Link><span aria-hidden="true">/</span><span>Procès-verbal</span></nav>
      <Link className="back-link" to="/soutenances">Retour a la liste</Link>

      <PageHeader title="Procès-verbal de soutenance" description="Consultez les informations validées pour cette soutenance et son jury." instruction="Contrôlez les données ci-dessous avant d'ouvrir le procès-verbal PDF." />

      <div className="detail-card">
        <h3>Etudiant</h3>
        <p>
          {soutenance.etudiant_nom} {soutenance.etudiant_prenoms} ({soutenance.matricule}) - {soutenance.niveau} / {soutenance.parcours}
        </p>

        <h3>Organisme d'accueil</h3>
        <p>{soutenance.organisme} - {soutenance.organisme_lieu}</p>

        <h3>Annee universitaire</h3>
        <p>{soutenance.annee_univ}</p>

        <h3>Note obtenue</h3>
        <p><strong>{soutenance.note}/20</strong></p>

        <h3>Membres du jury</h3>
        <ul>
          <li>President : {soutenance.president_nom}</li>
          <li>Examinateur : {soutenance.examinateur_nom}</li>
          <li>Rapporteur interne : {soutenance.rapporteur_int_nom}</li>
          {soutenance.rapporteur_ext_nom && (
            <li>Rapporteur externe : {soutenance.rapporteur_ext_nom}</li>
          )}
        </ul>

        {can("pdf", "voir") && <div className="detail-actions">
          <a href={getPvUrl(id)} target="_blank" rel="noreferrer">
            <button>Afficher le PDF</button>
          </a>
        </div>}
      </div>
    </div>
  );
}

export default ProcesVerbal;
