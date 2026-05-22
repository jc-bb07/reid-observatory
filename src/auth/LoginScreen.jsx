import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const r = await signIn(email, password);
    if (!r.ok) setError(r.error || "Invalid credentials");
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 6, padding: "9px 12px", color: "#f1f5f9",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:360, background:"#1e293b", borderRadius:12, padding:28 }}>
        <div style={{ color:"#a78bfa", fontWeight:700, fontSize:14, marginBottom:4 }}>
          🔒 Restricted Access
        </div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:20, lineHeight:1.6 }}>
          Research tools are available to invited regulators and researchers only.
          To request access contact{" "}
          <span style={{ color:"#60a5fa" }}>james.cochrane@coalfinch.com</span>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Email</div>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="you@organisation.gov"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Password</div>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ background:"#450a0a", border:"1px solid #ef4444", borderRadius:6,
            padding:"8px 12px", color:"#fca5a5", fontSize:12, marginBottom:12 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", background:loading?"#1e3a5f":"#4c1d95", color:"#fff",
            border:"none", borderRadius:6, padding:10, fontSize:13, fontWeight:600,
            cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
