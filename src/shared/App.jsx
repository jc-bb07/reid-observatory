import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { LoginScreen } from "./auth/LoginScreen";
import { RestrictedArea } from "./restricted/RestrictedArea";
import { OverviewTab, AreaTab, KAnonTab } from "./public/PublicTabs";
import { ISLANDS, ISLAND_KEYS } from "./data/constants";

const PUBLIC_TABS = [
  { id:"overview",    label:"Overview"         },
  { id:"areas",       label:"Area Explorer"    },
  { id:"kanon",       label:"k-Anonymity"      },
  { id:"restricted",  label:"🔒 Restricted Tools" },
];

function AppContent() {
  const { user, authLoading } = useAuth();
  const [tab, setTab] = useState("overview");

  const totalPop = ISLAND_KEYS.reduce((s, k) => s + ISLANDS[k].population, 0);

  const tabContent = {
    overview:   <OverviewTab/>,
    areas:      <AreaTab/>,
    kanon:      <KAnonTab/>,
    restricted: authLoading
      ? <div style={{ color:"#64748b", padding:20 }}>Loading…</div>
      : user
        ? <RestrictedArea/>
        : <LoginScreen/>,
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0f172a", minHeight: "100vh",
      color: "#e2e8f0", padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ display:"flex", gap:2 }}>
            {ISLAND_KEYS.map((k, i) => (
              <div key={i} style={{ width:4, height:28, background:ISLANDS[k].color, borderRadius:2 }}/>
            ))}
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:19, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.01em" }}>
              Crown Dependencies Re-Identification Observatory
            </h1>
            <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>
              Isle of Man · Guernsey · Jersey — 2021 census · {totalPop.toLocaleString()} residents · 47 areas
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid #1e293b" }}>
        {PUBLIC_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 14px", border: "none", background: "none", cursor: "pointer",
            color: t.id === "restricted"
              ? (tab === t.id ? "#a78bfa" : "#7c3aed")
              : (tab === t.id ? "#60a5fa" : "#64748b"),
            borderBottom: tab === t.id
              ? `2px solid ${t.id === "restricted" ? "#a78bfa" : "#60a5fa"}`
              : "2px solid transparent",
            fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
            marginBottom: -1, whiteSpace: "nowrap",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:960 }}>
        {tabContent[tab]}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent/>
    </AuthProvider>
  );
}
