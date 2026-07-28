const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error("Impossible de contacter l'API. En développement, démarrez le serveur PHP sur le port 8000 puis Vite ; en production, définissez VITE_API_URL.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Erreur API ${response.status}: ${response.statusText || "requete echouee"}`,
    );
  }

  if (result && result.success === false) {
    throw new Error(result.message || result.error || "Erreur API");
  }

  return result?.data ?? result;
}

// ==================== ETUDIANTS ====================
export function getEtudiants() {
  return request("/etudiants");
}

export function getEtudiant(matricule) {
  return request(`/etudiants/${encodeURIComponent(matricule)}`);
}

export function rechercherEtudiants(q) {
  return request(`/etudiants/recherche?q=${encodeURIComponent(q)}`);
}

export function getEtudiantsParNiveau(niveau) {
  return request(`/etudiants/par-niveau?niveau=${encodeURIComponent(niveau)}`);
}

export function getEffectifs() {
  return request("/etudiants/effectifs");
}

export function getEtudiantsNonSoutenus() {
  return request("/etudiants/non-soutenus");
}

export function createEtudiant(data) {
  return request("/etudiants", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEtudiant(matricule, data) {
  return request(`/etudiants/${encodeURIComponent(matricule)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteEtudiant(matricule) {
  return request(`/etudiants/${encodeURIComponent(matricule)}`, {
    method: "DELETE",
  });
}

// ==================== PROFESSEURS ====================
export function getProfesseurs() {
  return request("/professeurs");
}

export function getProfesseur(idprof) {
  return request(`/professeurs/${encodeURIComponent(idprof)}`);
}

export function createProfesseur(data) {
  return request("/professeurs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProfesseur(idprof, data) {
  return request(`/professeurs/${encodeURIComponent(idprof)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProfesseur(idprof) {
  return request(`/professeurs/${encodeURIComponent(idprof)}`, {
    method: "DELETE",
  });
}

// ==================== ORGANISMES ====================
export function getOrganismes() {
  return request("/organismes");
}

export function getOrganisme(idorg) {
  return request(`/organismes/${encodeURIComponent(idorg)}`);
}

export function createOrganisme(data) {
  return request("/organismes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateOrganisme(idorg, data) {
  return request(`/organismes/${encodeURIComponent(idorg)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteOrganisme(idorg) {
  return request(`/organismes/${encodeURIComponent(idorg)}`, {
    method: "DELETE",
  });
}

// ==================== SOUTENANCES ====================
export function getSoutenances() {
  return request("/soutenances");
}

export function getSoutenance(id) {
  return request(`/soutenances/${encodeURIComponent(id)}`);
}

export function getNotesParPeriode(debut, fin) {
  return request(`/soutenances/notes?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`);
}

export function getPvUrl(id) {
  return `${API_BASE_URL}/soutenances/${encodeURIComponent(id)}/pv`;
}

export function createSoutenance(data) {
  return request("/soutenances", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSoutenance(id, data) {
  return request(`/soutenances/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteSoutenance(id) {
  return request(`/soutenances/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
