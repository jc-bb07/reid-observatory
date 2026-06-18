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
      // Keep the FULL user object (id, email, app_metadata, user_metadata, etc.)
      // rather than discarding everything except email.
      return { ok: true, user: data.user };
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
  },
  getToken() {
    return sessionStorage.getItem("sb_token");
  },
  // Re-fetch the current user's live record from Supabase using the stored
  // token, instead of trusting a cached value. This is what makes a fresh
  // page load (not just a full sign-out/sign-in) pick up permission changes
  // made in the database, and what lets an expired/revoked token actually
  // log the user out instead of leaving a stale "logged in" state forever.
  async getUser(token) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  },
};

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = sb.getToken();
      if (token) {
        const liveUser = await sb.getUser(token);
        if (liveUser && !liveUser.error) {
          setUser(liveUser);
        } else {
          // Token expired or invalid — don't keep treating this as a logged-in session.
          sessionStorage.removeItem("sb_token");
        }
      }
      setAuthLoading(false);
    })();
  }, []);

  const signIn = async (email, password) => {
    const r = await sb.signIn(email, password);
    if (r.ok) setUser(r.user);
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
