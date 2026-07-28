import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSoutenance,
  getEtudiant,
  getOrganisme,
  getProfesseur,
  getPvUrl,
} from "../api/api";
import PageHeader from "../components/PageHeader";

function ProcesVerbal() {
  const { id } = useParams();

  const [soutenance, setSoutenance] = useState(null);
  const [etudiant, setEtudiant] = useState(null);
  const [organisme, setOrganisme] = useState(null);
  const [president, setPresident] = useState(null);
  const [examinateur, setExaminateur] = useState(null);
  const [rapporteurInt, setRapporteurInt] = useState(null);
  const [rapporteurExt, setRapporteurExt] = useState(null);

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

      const [dataEtudiant, dataOrganisme, dataPresident, dataExaminateur, dataRapInt] =
        await Promise.all([
          getEtudiant(dataSoutenance.matricule),
          getOrganisme(dataSoutenance.idorg),
          getProfesseur(dataSoutenance.president),
          getProfesseur(dataSoutenance.examinateur),
          getProfesseur(dataSoutenance.rapporteur_int),
        ]);

      setEtudiant(dataEtudiant);
      setOrganisme(dataOrganisme);
      setPresident(dataPresident);
      setExaminateur(dataExaminateur);
      setRapporteurInt(dataRapInt);

      if (dataSoutenance.rapporteur_ext) {
        const dataRapExt = await getProfesseur(dataSoutenance.rapporteur_ext);
        setRapporteurExt(dataRapExt);
      }
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
      <Link className="back-link" to="/soutenances">Retour a la liste</Link>

      <PageHeader title="Procès-verbal de soutenance" description="Consultez les informations validées pour cette soutenance et son jury." instruction="Contrôlez les données ci-dessous avant d'ouvrir le procès-verbal PDF." />

      <div className="detail-card">
        <h3>Etudiant</h3>
        <p>
          {etudiant.nom} {etudiant.prenoms} ({etudiant.matricule}) - {etudiant.niveau} / {etudiant.parcours}
        </p>

        <h3>Organisme d'accueil</h3>
        <p>{organisme.design} - {organisme.lieu}</p>

        <h3>Annee universitaire</h3>
        <p>{soutenance.annee_univ}</p>

        <h3>Note obtenue</h3>
        <p><strong>{soutenance.note}/20</strong></p>

        <h3>Membres du jury</h3>
        <ul>
          <li>President : {president.civilite} {president.nom} - {president.grade}</li>
          <li>Examinateur : {examinateur.civilite} {examinateur.nom} - {examinateur.grade}</li>
          <li>Rapporteur interne : {rapporteurInt.civilite} {rapporteurInt.nom} - {rapporteurInt.grade}</li>
          {rapporteurExt && (
            <li>Rapporteur externe : {rapporteurExt.civilite} {rapporteurExt.nom} - {rapporteurExt.grade}</li>
          )}
        </ul>

        <div className="detail-actions">
          <a href={getPvUrl(id)} target="_blank" rel="noreferrer">
            <button>Afficher le PDF</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProcesVerbal;
