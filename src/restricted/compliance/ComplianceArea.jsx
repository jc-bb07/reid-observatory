import { useState } from "react";
import { marked } from "marked";
import { useAuth } from "../../auth/AuthProvider";
import dppMd from "./DATA_PROTECTION_POLICY.md?raw";
import dpiaMd from "./DPIA_OBSERVATORY.md?raw";
import traMd from "./TRANSFER_RISK_ASSESSMENT.md?raw";
import "./compliance.css";

// Colour tokens — keep in sync with App.jsx / RestrictedArea.jsx
const C = {
  bg:      "#0f172a",
  surface: "#1e293b",
  border2: "#334155",
  text:    "#e2e8f0",
  muted:   "#64748b",
  muted2:  "#94a3b8",
  purple:  "#a78bfa",
};

const DOCS = [
  { id: "dpp",  label: "Data Protection Policy",  content: dppMd },
  { id: "dpia", label: "DPIA",                     content: dpiaMd },
  { id: "tra",  label: "Transfer Risk Assessment", content: traMd },
];

export function ComplianceArea() {
  const { user, signOut } = useAuth();
  const [active, setActive] = useState("dpp");
  const activeDoc = DOCS.find(d => d.id === active);

  return (
    <div>
      {/* Auth bar — same pattern as RestrictedArea */}
      <div style={{
        background: C.surface, borderRadius: 8, padding: "10px 16px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderLeft: `3px solid ${C.purple}`,
      }}>
        <div style={{ color: C.purple, fontSize: 12 }}>
          📋 Compliance — logged in as <strong style={{ color: C.text }}>{user.email}</strong>
        </div>
        <button onClick={signOut} style={{
          background: "none", border: `1px solid ${C.border2}`, color: C.muted,
          borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
          fontFamily: "inherit",
        }}>
          Sign out
        </button>
      </div>

      {/* Context note */}
      <div style={{
        background: C.bg, borderRadius: 8, padding: 14,
        borderLeft: `3px solid ${C.purple}`, marginBottom: 16,
      }}>
        <div style={{ color: C.muted2, fontSize: 12, lineHeight: 1.6 }}>
          Internal governance records for the Observatory — working documents, not
          legal advice, and not the public Privacy Policy
          (see <a href="/privacy.html" style={{ color: C.purple }}>/privacy.html</a>).
          These are rendered directly from the source markdown files committed to the
          repository, so what you see here is always the current version — no copies
          to keep in sync.
        </div>
      </div>

      {/* Doc switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {DOCS.map(d => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            style={{
              background: active === d.id ? C.purple : "none",
              color: active === d.id ? "#0f172a" : C.muted2,
              border: `1px solid ${active === d.id ? C.purple : C.border2}`,
              borderRadius: 6, padding: "6px 12px", fontSize: 11.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Rendered markdown — content is fully authored in this repo, not user input,
          so dangerouslySetInnerHTML is safe here. Don't reuse this pattern for any
          content that isn't committed by you. */}
      <div
        className="compliance-doc"
        dangerouslySetInnerHTML={{ __html: marked.parse(activeDoc.content) }}
      />
    </div>
  );
}
