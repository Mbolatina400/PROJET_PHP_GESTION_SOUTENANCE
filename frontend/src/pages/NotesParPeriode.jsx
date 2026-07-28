import { useState } from "react";
import { getNotesParPeriode } from "../api/api";
import PageHeader from "../components/PageHeader";

function NotesParPeriode() {
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aRecherche, setARecherche] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await getNotesParPeriode(debut, fin);
      setNotes(data);
      setARecherche(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Notes par période" description="Comparez les résultats obtenus sur une plage d'années universitaires." instruction="Saisissez les années au format AAAA-AAAA, puis lancez la recherche." />

      <form className="notes-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Année début (ex: 2022-2023)"
          value={debut}
          onChange={(e) => setDebut(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Année fin (ex: 2024-2025)"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          required
        />
        <button type="submit">Rechercher</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

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
                  <td>{n.note}/20</td>
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
