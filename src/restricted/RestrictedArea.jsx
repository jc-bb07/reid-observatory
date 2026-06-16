import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { AttackSimulator } from "./AttackSimulator";

// Colour tokens — keep in sync with App.jsx and observatory.css
const C = {
  bg:      "#0f172a",
  surface: "#1e293b",
  border2: "#334155",
  text:    "#e2e8f0",
  muted:   "#64748b",
  muted2:  "#94a3b8",
  red:     "#f87171",
  purple:  "#a78bfa",
};

export function RestrictedArea() {
  const { user, signOut } = useAuth();

  return (
    <div>
      {/* Auth bar */}
      <div style={{
        background: C.surface, borderRadius: 8, padding: "10px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderLeft: `3px solid ${C.purple}`,
      }}>
        <div style={{ color: C.purple, fontSize: 12 }}>
          🔒 Restricted — logged in as <strong style={{ color: C.text }}>{user.email}</strong>
        </div>
        <button onClick={signOut} style={{
          background: "none", border: `1px solid ${C.border2}`, color: C.muted,
          borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
          fontFamily: "inherit",
        }}>
          Sign out
        </button>
      </div>

      {/* Warning */}
      <div style={{
        background: C.bg, borderRadius: 8, padding: 14,
        borderLeft: `3px solid ${C.red}`, marginBottom: 16,
      }}>
        <div style={{ color: C.red, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          ⚠ Restricted Research Tools
        </div>
        <div style={{ color: C.muted2, fontSize: 12, lineHeight: 1.6 }}>
          These tools demonstrate re-identification vulnerabilities using publicly available
          census data. Access is restricted to invited regulators and researchers.
          Do not share outputs without explicit permission from Coalfinch Data Governance Advisory.
        </div>
      </div>

      <AttackSimulator/>
    </div>
  );
}

