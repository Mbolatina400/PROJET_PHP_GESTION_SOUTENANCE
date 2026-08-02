import { useState, useEffect } from "react";
import { getEtudiantsParNiveau, getRapportEffectifs } from "../api/api";
import { NIVEAUX } from "../utils/constants";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Feedback";

function EffectifsNiveau() {
  const [niveauChoisi, setNiveauChoisi] = useState("L1");
  const [etudiants, setEtudiants] = useState([]);
  const [totalNiveau, setTotalNiveau] = useState(0);
  const [effectifs, setEffectifs] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    chargerEffectifs();
  }, []);

  useEffect(() => {
    chargerEtudiantsParNiveau(niveauChoisi);
  }, [niveauChoisi]);

  async function chargerEffectifs() {
    try {
      const data = await getRapportEffectifs();
      setEffectifs(Array.isArray(data.effectifs) ? data.effectifs.map((item) => ({ ...item, total: Number(item.total) || 0 })) : []);
      setResultats(Array.isArray(data.resultats) ? data.resultats.map((item) => ({
        ...item,
        total: Number(item.total) || 0,
        reussites: Number(item.reussites) || 0,
        moyenne: item.moyenne == null ? null : Number(item.moyenne),
      })) : []);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  }

  async function chargerEtudiantsParNiveau(niveau) {
    try {
      setLoading(true);
      const data = await getEtudiantsParNiveau(niveau);
      setEtudiants(data.etudiants);
      setTotalNiveau(data.total);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function effectifDuNiveau(niveau) {
    const item = effectifs.find((e) => e.niveau === niveau);
    return item ? item.total : 0;
  }

  function resultatDuNiveau(niveau) { return resultats.find((resultat) => resultat.niveau === niveau); }

  function changerNiveau(niveau) {
    setNiveauChoisi(niveau);
    setRecherche("");
  }

  function exporterListe() {
    const entetes = ["Matricule", "Nom", "Prénoms", "Parcours"];
    const lignes = etudiantsFiltres.map((etudiant) => [
      etudiant.matricule,
      etudiant.nom,
      etudiant.prenoms,
      etudiant.parcours,
    ]);
    const csv = [entetes, ...lignes]
      .map((ligne) => ligne.map((valeur) => `"${String(valeur).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    lien.download = `effectifs-${niveauChoisi}.csv`;
    lien.click();
    URL.revokeObjectURL(lien.href);
    notify(`La liste des étudiants ${niveauChoisi} a été exportée.`);
  }

  const totalGeneral = effectifs.reduce((acc, e) => acc + e.total, 0);
  const totalSoutenances = resultats.reduce((total, resultat) => total + resultat.total, 0);
  const moyenneGenerale = resultats.reduce((total, resultat) => total + ((resultat.moyenne ?? 0) * resultat.total), 0) / (totalSoutenances || 1);
  const terme = recherche.trim().toLocaleLowerCase();
  const etudiantsFiltres = etudiants.filter((etudiant) =>
    [etudiant.matricule, etudiant.nom, etudiant.prenoms]
      .some((valeur) => String(valeur ?? "").toLocaleLowerCase().includes(terme))
  );

  return (
    <div className="effectifs-page">
      <PageHeader
        title="Effectifs par niveau"
        description="Visualisez la répartition des étudiants, puis consultez le détail d'un niveau."
        instruction="Sélectionnez un niveau pour mettre à jour la liste détaillée automatiquement."
        actions={<button className="export-button" type="button" onClick={exporterListe}><span aria-hidden="true">↓</span>Exporter</button>}
      />

      <section aria-labelledby="recapitulatif-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Vue d'ensemble</p>
            <h3 id="recapitulatif-title">Récapitulatif des effectifs</h3>
          </div>
          <p>Nombre d'étudiants enregistrés par niveau.</p>
        </div>
        <div className="effectif-summary-grid">
          {NIVEAUX.map((niveau) => (
            <article className="effectif-summary-card" key={niveau}>
              <span>{niveau}</span>
              <strong>{effectifDuNiveau(niveau)}</strong>
              <small>étudiants</small>
            </article>
          ))}
          <article className="effectif-summary-card effectif-summary-total">
            <span>Total</span>
            <strong>{totalGeneral}</strong>
            <small>étudiants</small>
          </article>
        </div>
      </section>

      <section className="statistics-panel" aria-labelledby="statistics-title">
        <div className="section-heading">
          <div><p className="section-kicker">Tableau de bord</p><h3 id="statistics-title">Résultats par niveau</h3></div>
          <p>Les effectifs sont présentés ci-dessus. Les moyennes reposent sur les soutenances enregistrées.</p>
        </div>
        <div className="kpi-grid" aria-label="Indicateurs clés">
          <article><span>Soutenances</span><strong>{totalSoutenances}</strong></article>
          <article><span>Moyenne générale</span><strong>{totalSoutenances ? `${moyenneGenerale.toFixed(1)}/20` : "—"}</strong></article>
          <article><span>Réussite ≥ 10/20</span><strong>{totalSoutenances ? `${Math.round((resultats.reduce((total, resultat) => total + resultat.reussites, 0) / totalSoutenances) * 100)}%` : "—"}</strong></article>
        </div>
        <div className="results-list results-list-wide">
          {NIVEAUX.map((niveau) => {
            const resultat = resultatDuNiveau(niveau);
            const moyenne = resultat?.moyenne;
            const moyenneLabel = moyenne == null ? "Aucune note" : `${moyenne.toFixed(1)}/20`;
            return <article className="result-row" key={niveau}>
              <span className={`level-badge level-${niveau.toLowerCase()}`}>{niveau}</span>
              <div className="result-progress" aria-label={`Moyenne ${niveau}: ${moyenneLabel}`}>
                <span className="result-progress-track"><span className="result-progress-value" style={{ width: `${moyenne == null ? 0 : (moyenne / 20) * 100}%` }} /></span>
              </div>
              <div className="result-score"><strong>{moyenneLabel}</strong><small>{resultat?.total ?? 0} soutenance{resultat?.total > 1 ? "s" : ""}</small></div>
            </article>;
          })}
        </div>
      </section>

      <section className="effectif-details" aria-labelledby="details-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Liste détaillée</p>
            <h3 id="details-title">Étudiants du niveau {niveauChoisi}</h3>
          </div>
          <p><strong>{totalNiveau}</strong> étudiant{totalNiveau > 1 ? "s" : ""} au total</p>
        </div>

        <div className="effectif-toolbar">
          <div className="niveau-tabs" role="tablist" aria-label="Choisir un niveau">
            {NIVEAUX.map((niveau) => (
              <button
                className={niveau === niveauChoisi ? "active" : ""}
                key={niveau}
                type="button"
                role="tab"
                aria-selected={niveau === niveauChoisi}
                onClick={() => changerNiveau(niveau)}
              >
                {niveau} <span>· {effectifDuNiveau(niveau)}</span>
              </button>
            ))}
          </div>
          <label className="effectif-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un étudiant" aria-label="Rechercher un étudiant" />
          </label>
        </div>

        {loading ? (
          <p className="loading-state">Chargement des étudiants…</p>
        ) : etudiantsFiltres.length === 0 ? (
          <div className="effectif-empty-state">
            <span aria-hidden="true">♙</span>
            <h3>{recherche ? "Aucun résultat trouvé" : `Aucun étudiant en ${niveauChoisi} pour le moment.`}</h3>
            <p>{recherche ? "Essayez un autre nom, prénom ou matricule." : "Les étudiants ajoutés à ce niveau apparaîtront ici."}</p>
          </div>
        ) : (
          <table>
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "23%" }} />
              <col style={{ width: "17%" }} />
            </colgroup>
            <thead><tr><th>Matricule</th><th>Nom</th><th>Prénoms</th><th>Parcours</th></tr></thead>
            <tbody>{etudiantsFiltres.map((e) => <tr key={e.matricule}><td>{e.matricule}</td><td>{e.nom}</td><td>{e.prenoms}</td><td><span className={`parcours-badge parcours-${String(e.parcours).toLowerCase()}`}>{e.parcours}</span></td></tr>)}</tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default EffectifsNiveau;
