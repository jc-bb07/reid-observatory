import { useState, useEffect, createContext, useContext } from "react";

const SUPABASE_URL = "https://kxgsccdgkyvdzgfrmqvw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Z3NjY2Rna3l2ZHpnZnJtcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mzk2ODIsImV4cCI6MjA5NTAxNTY4Mn0.mOTIToXlxUfwXKgfhFAtT3BP1zj9rMn3lUMjOsD0sGw";

const sb = {
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access_token) {
      sessionStorage.setItem("sb_token", data.access_token);
      sessionStorage.setItem("sb_email", data.user?.email || email);
      return { ok: true, email: data.user?.email };
    }
    return { ok: false, error: data.error_description || "Invalid credentials" };
  },
  async signOut() {
    const token = sessionStorage.getItem("sb_token");
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem("sb_token");
    sessionStorage.removeItem("sb_email");
  },
  getSession() {
    const token = sessionStorage.getItem("sb_token");
    const email = sessionStorage.getItem("sb_email");
    return token ? { token, email } : null;
  }
};

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const s = sb.getSession();
    if (s) setUser({ email: s.email });
    setAuthLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const r = await sb.signIn(email, password);
    if (r.ok) setUser({ email: r.email });
    return r;
  };

  const signOut = async () => {
    await sb.signOut();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, authLoading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
