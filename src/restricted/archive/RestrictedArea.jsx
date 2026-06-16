import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { AttackSimulator } from "./AttackSimulator";

export function RestrictedArea() {
  const { user, signOut } = useAuth();

  return (
    <div>
      {/* Auth bar */}
      <div style={{
        background:"#1e293b", borderRadius:8, padding:"10px 16px", marginBottom:16,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderLeft:"3px solid #7c3aed",
      }}>
        <div style={{ color:"#a78bfa", fontSize:12 }}>
          🔒 Restricted — logged in as <strong>{user.email}</strong>
        </div>
        <button onClick={signOut} style={{
          background:"none", border:"1px solid #334155", color:"#64748b",
          borderRadius:4, padding:"4px 10px", fontSize:11, cursor:"pointer",
        }}>
          Sign out
        </button>
      </div>

      {/* Warning */}
      <div style={{
        background:"#0f172a", borderRadius:8, padding:14,
        borderLeft:"3px solid #ef4444", marginBottom:16,
      }}>
        <div style={{ color:"#fca5a5", fontSize:12, fontWeight:600, marginBottom:4 }}>
          ⚠ Restricted Research Tools
        </div>
        <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>
          These tools demonstrate re-identification vulnerabilities using publicly available
          census data. Access is restricted to invited regulators and researchers.
          Do not share outputs without explicit permission from Coalfinch Data Governance Advisory.
        </div>
      </div>

      <AttackSimulator/>
    </div>
  );
}

