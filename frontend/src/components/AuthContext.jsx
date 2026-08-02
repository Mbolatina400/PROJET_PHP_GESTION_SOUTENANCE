import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, login as loginRequest, logout as logoutRequest, setCsrfToken } from "../api/api";

const AuthContext = createContext({ user: null, loading: true, can: () => false, login: async () => {}, logout: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCurrentUser().then((currentUser) => { setCsrfToken(currentUser.csrf_token); setUser(currentUser); }).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);

  async function login(credentials) { const currentUser = await loginRequest(credentials); setCsrfToken(currentUser.csrf_token); setUser(currentUser); return currentUser; }
  async function logout() { try { await logoutRequest(); } finally { setCsrfToken(null); setUser(null); } }
  function can(resource, action) { return user?.role === "admin" || Boolean(user?.permissions?.includes(`${resource}.${action}`)); }

  return <AuthContext.Provider value={{ user, loading, can, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
