soutenances-frontend/
├── src/
│   ├── api/
│   │   └── api.js              // ny fetch rehetra any amin'ny backend PHP, mitovy amin'GestionProduits
│   │
│   ├── components/
│   │   ├── Navbar.jsx           // menu ambony (liens vers Etudiants, Professeurs, Organismes, Soutenances)
│   │   └── ConfirmDialog.jsx    // popup "Sûr ianao ta hamafa?" (facultatif, azo ampiana atỳ aoriana)
│   │
│   ├── pages/
│   │   ├── Etudiants.jsx        // liste + formulaire + recherche (CRUD étudiant tsy misaraka)
│   │   ├── Professeurs.jsx      // liste + formulaire (CRUD professeur)
│   │   ├── Organismes.jsx       // liste + formulaire (CRUD organisme)
│   │   ├── Soutenances.jsx      // liste + formulaire soutenance
│   │   └── ProcesVerbal.jsx     // bouton "Générer PDF" ho an'ny soutenance iray
│   │
│   ├── App.jsx                  // routes rehetra eto
│   ├── main.jsx
│
├── package.json
└── vite.config.js

---

## 📋 ENDPOINTS API DISPONIBLES

### 👨‍🎓 **ETUDIANTS** (`/api/etudiants`)

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|-----------|
| GET | `/api/etudiants` | Récupérer tous les étudiants | - |
| GET | `/api/etudiants/{matricule}` | Récupérer un étudiant | `matricule` (URL param) |
| GET | `/api/etudiants/recherche` | Rechercher des étudiants | `q` (query param - obligatoire) |
| GET | `/api/etudiants/par-niveau` | Lister étudiants par niveau | `niveau` (query param: L1, L2, L3, M1, M2) |
| GET | `/api/etudiants/effectifs` | Obtenir les effectifs par niveau | - |
| GET | `/api/etudiants/non-soutenus` | Récupérer les étudiants non soutenus | - |
| POST | `/api/etudiants` | Créer un nouvel étudiant | `matricule`, `nom`, `prenoms`, `niveau`, `parcours`, `adr_email` (optionnel) |
| PUT | `/api/etudiants/{matricule}` | Modifier un étudiant | `nom`, `prenoms`, `niveau`, `parcours`, `adr_email` (optionnel) |
| DELETE | `/api/etudiants/{matricule}` | Supprimer un étudiant | - |

**Valeurs autorisées:**
- Niveaux: `L1`, `L2`, `L3`, `M1`, `M2`
- Parcours: `GB`, `SR`, `IG`

---

### 👨‍🏫 **PROFESSEURS** (`/api/professeurs`)

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|-----------|
| GET | `/api/professeurs` | Récupérer tous les professeurs | - |
| GET | `/api/professeurs/{idprof}` | Récupérer un professeur | `idprof` (URL param) |
| POST | `/api/professeurs` | Créer un professeur | `idprof`, `nom`, `prenoms`, `civilite`, `grade` |
| PUT | `/api/professeurs/{idprof}` | Modifier un professeur | `nom`, `prenoms`, `civilite`, `grade` |
| DELETE | `/api/professeurs/{idprof}` | Supprimer un professeur | - |

**Valeurs autorisées:**
- Civilité: `Mr`, `Mlle`, `Mme`

---

### 🏢 **ORGANISMES** (`/api/organismes`)

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|-----------|
| GET | `/api/organismes` | Récupérer tous les organismes | - |
| GET | `/api/organismes/{idorg}` | Récupérer un organisme | `idorg` (URL param) |
| POST | `/api/organismes` | Créer un organisme | `design`, `lieu` |
| PUT | `/api/organismes/{idorg}` | Modifier un organisme | `design`, `lieu` |
| DELETE | `/api/organismes/{idorg}` | Supprimer un organisme | - |

---

### 🎓 **SOUTENANCES** (`/api/soutenances`)

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|-----------|
| GET | `/api/soutenances` | Récupérer toutes les soutenances | - |
| GET | `/api/soutenances/{id}` | Récupérer une soutenance | `id` (URL param) |
| GET | `/api/soutenances/notes` | Récupérer les notes par période | `debut`, `fin` (query params - format: 2022-2023) |
| GET | `/api/soutenances/{id}/pv` | Télécharger le procès-verbal (PDF) | `id` (URL param) |
| POST | `/api/soutenances` | Créer une soutenance | `matricule`, `idorg`, `annee_univ`, `note`, `president`, `examinateur`, `rapporteur_int`, `rapporteur_ext` (optionnel) |
| PUT | `/api/soutenances/{id}` | Modifier une soutenance | `matricule`, `idorg`, `annee_univ`, `note`, `president`, `examinateur`, `rapporteur_int`, `rapporteur_ext` (optionnel) |
| DELETE | `/api/soutenances/{id}` | Supprimer une soutenance | - |

**Valeurs autorisées:**
- `annee_univ`: Format `YYYY-YYYY` (ex: 2022-2023)
- `note`: Entier entre 0 et 20
- `president`, `examinateur`, `rapporteur_int`, `rapporteur_ext`: IDs de professeurs

---

### 📝 **NOTES IMPORTANTES**

1. **Format des réponses**: Toutes les réponses suivent le format JSON:
   ```json
   {
     "success": true/false,
     "data": {...},
     "message": "...",
     "statusCode": 200/400/404
   }
   ```

2. **Codes HTTP utilisés**:
   - `200`: Succès
   - `201`: Création réussie
   - `400`: Erreur de validation
   - `404`: Ressource non trouvée
   - `500`: Erreur serveur

3. **Base URL**: `http://localhost:8000/` (à adapter selon ta configuration)