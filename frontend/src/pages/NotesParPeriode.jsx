import { useState } from "react";
import { getNotesParPeriode } from "../api/api";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Feedback";

function NotesParPeriode() {
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [aRecherche, setARecherche] = useState(false);
  const scoreClass = (note) => note >= 16 ? "score-excellent" : note >= 12 ? "score-good" : note >= 10 ? "score-average" : "score-low";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await getNotesParPeriode(debut, fin);
      setNotes(data);
      setARecherche(true);
      notify(`${data.length} note${data.length > 1 ? "s" : ""} trouvée${data.length > 1 ? "s" : ""}.`);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Notes par période" description="Comparez les résultats obtenus sur une plage d'années universitaires." instruction="Saisissez les années au format AAAA-AAAA, puis lancez la recherche." />

      <form className="notes-search-form" onSubmit={handleSubmit}>
        <label className="form-field"><span>Année de début <b>*</b></span><input
          type="text" placeholder="ex. 2022-2023" pattern="[0-9]{4}-[0-9]{4}"
          value={debut}
          onChange={(e) => setDebut(e.target.value)}
          required
        /></label>
        <label className="form-field"><span>Année de fin <b>*</b></span><input
          type="text" placeholder="ex. 2024-2025" pattern="[0-9]{4}-[0-9]{4}"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          required
        /></label>
        <button type="submit">Rechercher</button>
      </form>

      {loading ? (
        <p>Chargement...</p>
      ) : aRecherche ? (
        <section className="notes-list-section">
        <table>
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénoms</th>
              <th>Année univ.</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan="5">Aucune note trouvée pour cette période</td>
              </tr>
            ) : (
              notes.map((n, index) => (
                <tr key={index}>
                  <td>{n.matricule}</td>
                  <td>{n.nom}</td>
                  <td>{n.prenoms}</td>
                  <td>{n.annee_univ}</td>
                  <td><span className={`score-badge ${scoreClass(Number(n.note))}`}>{n.note}/20</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </section>
      ) : (
        <p>Saisissez une période pour afficher les notes.</p>
      )}
    </div>
  );
}

export default NotesParPeriode;
