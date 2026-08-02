import { createContext, useContext, useEffect, useState } from "react";
import { getEtablissement } from "../api/api";
import { useAuth } from "./AuthContext";

const EtablissementContext = createContext({ etablissement: null, refreshEtablissement: async () => {} });

export function EtablissementProvider({ children }) {
  const [etablissement, setEtablissement] = useState(null);
  const { can } = useAuth();
  const canReadEtablissement = can("etablissement", "voir");

  async function refreshEtablissement() {
    if (!canReadEtablissement) {
      setEtablissement(null);
      return;
    }
    try { setEtablissement(await getEtablissement()); } catch { setEtablissement(null); }
  }

  useEffect(() => { refreshEtablissement(); }, [canReadEtablissement]);

  return <EtablissementContext.Provider value={{ etablissement, refreshEtablissement }}>{children}</EtablissementContext.Provider>;
}

export function useEtablissement() {
  return useContext(EtablissementContext);
}
