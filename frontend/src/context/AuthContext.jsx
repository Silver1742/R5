import { createContext, useContext, useEffect, useState } from "react";
import api, { API_URL } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "r5-token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  function loginWithToken(token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return loadUser();
  }

  function loginWithProvider(provider) {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
