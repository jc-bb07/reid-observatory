import { useState, useMemo, useEffect, createContext, useContext } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, LineChart, Line, ResponsiveContainer, ReferenceLine
} from "recharts";

// ── Supabase config ───────────────────────────────────────────────────────────
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

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function AuthProvider({ children }) {
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
  const signOut = async () => { await sb.signOut(); setUser(null); };
  return <AuthCtx.Provider value={{ user, authLoading, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ── Data ──────────────────────────────────────────────────────────────────────
const DATA = {
  island_comparison: [
    { label: "Area + Sex",         n_qi:2, iom:0.00, guernsey:0.00, jersey:0.00 },
    { label: "Area + Age",         n_qi:2, iom:0.00, guernsey:0.00, jersey:0.00 },
    { label: "Area + Age + Sex",   n_qi:3, iom:0.00, guernsey:0.00, jersey:0.00 },
    { label: "+ Occupation",       n_qi:4, iom:1.17, guernsey:0.44, jersey:0.24 },
    { label: "+ HH Size",          n_qi:4, iom:0.48, guernsey:0.17, jersey:0.01 },
    { label: "All 5 QIs",          n_qi:5, iom:9.18, guernsey:4.51, jersey:3.38 },
  ],
  islands: {
    iom: {
      name:"Isle of Man", population:84069, color:"#3b82f6",
      areas: [
        {id:13,name:"Bride",        population:359,   u_age_sex:0.0, u_age_sex_occ:18.66,u_all4:49.0 },
        {id:24,name:"Santon",       population:749,   u_age_sex:0.0, u_age_sex_occ:7.21, u_all4:40.7 },
        {id:15,name:"Jurby",        population:780,   u_age_sex:0.0, u_age_sex_occ:6.28, u_all4:35.9 },
        {id:20,name:"Maughold",     population:952,   u_age_sex:0.0, u_age_sex_occ:5.78, u_all4:29.4 },
        {id:11,name:"Ballaugh",     population:1041,  u_age_sex:0.0, u_age_sex_occ:5.76, u_all4:25.9 },
        {id:14,name:"German",       population:1056,  u_age_sex:0.0, u_age_sex_occ:5.77, u_all4:30.3 },
        {id:16,name:"Lezayre",      population:1230,  u_age_sex:0.0, u_age_sex_occ:4.47, u_all4:25.3 },
        {id:9, name:"Andreas",      population:1400,  u_age_sex:0.0, u_age_sex_occ:3.36, u_all4:23.6 },
        {id:22,name:"Patrick",      population:1487,  u_age_sex:0.0, u_age_sex_occ:2.89, u_all4:23.3 },
        {id:21,name:"Michael",      population:1522,  u_age_sex:0.0, u_age_sex_occ:2.89, u_all4:23.5 },
        {id:17,name:"Lonan",        population:1647,  u_age_sex:0.0, u_age_sex_occ:2.43, u_all4:21.7 },
        {id:7, name:"Laxey",        population:1656,  u_age_sex:0.0, u_age_sex_occ:2.42, u_all4:22.0 },
        {id:23,name:"Rushen",       population:1661,  u_age_sex:0.0, u_age_sex_occ:2.59, u_all4:22.5 },
        {id:10,name:"Arbory",       population:1899,  u_age_sex:0.0, u_age_sex_occ:2.21, u_all4:18.9 },
        {id:6, name:"Port St Mary", population:1989,  u_age_sex:0.0, u_age_sex_occ:2.11, u_all4:18.9 },
        {id:19,name:"Marown",       population:2220,  u_age_sex:0.0, u_age_sex_occ:1.80, u_all4:16.9 },
        {id:18,name:"Malew",        population:2367,  u_age_sex:0.0, u_age_sex_occ:1.31, u_all4:15.2 },
        {id:4, name:"Castletown",   population:3206,  u_age_sex:0.0, u_age_sex_occ:0.93, u_all4:11.0 },
        {id:12,name:"Braddan",      population:3404,  u_age_sex:0.0, u_age_sex_occ:1.09, u_all4:10.0 },
        {id:5, name:"Port Erin",    population:3730,  u_age_sex:0.0, u_age_sex_occ:0.83, u_all4:10.2 },
        {id:3, name:"Peel",         population:5710,  u_age_sex:0.0, u_age_sex_occ:0.49, u_all4:5.3  },
        {id:2, name:"Ramsey",       population:8288,  u_age_sex:0.0, u_age_sex_occ:0.23, u_all4:3.9  },
        {id:8, name:"Onchan",       population:9039,  u_age_sex:0.0, u_age_sex_occ:0.27, u_all4:3.3  },
        {id:1, name:"Douglas",      population:26677, u_age_sex:0.0, u_age_sex_occ:0.08, u_all4:0.7  },
      ],
      k_profiles: {
        "3qi":[100,100,100,99.99,99.97,99.95,99.92,99.87,99.84,99.80,99.75,99.68,99.64,99.59,99.39,99.29,99.13,98.85,98.66,98.55],
        "4qi":[100,98.83,97.19,95.44,93.57,91.48,89.54,87.61,85.77,83.89,82.16,80.35,78.80,77.20,75.74,74.33,72.93,71.59,70.28,69.01],
        "5qi":[100,90.82,81.93,73.33,65.64,58.85,52.72,47.27,42.61,38.46,34.76,31.56,28.81,26.37,24.26,22.37,20.69,19.22,17.90,16.73],
      }
    },
    guernsey: {
      name:"Guernsey", population:63448, color:"#10b981",
      areas: [
        {id:11,name:"Herm/Jethou",      population:85,    u_age_sex:0.0, u_age_sex_occ:50.59,u_all4:85.9 },
        {id:10,name:"Torteval",         population:1033,  u_age_sex:0.0, u_age_sex_occ:3.97, u_all4:29.3 },
        {id:8, name:"Forest",           population:1564,  u_age_sex:0.0, u_age_sex_occ:1.79, u_all4:19.8 },
        {id:9, name:"St Pierre du Bois",population:2077,  u_age_sex:0.0, u_age_sex_occ:1.59, u_all4:16.9 },
        {id:7, name:"St Andrew",        population:2372,  u_age_sex:0.0, u_age_sex_occ:1.52, u_all4:13.9 },
        {id:6, name:"St Saviour",       population:2840,  u_age_sex:0.0, u_age_sex_occ:0.63, u_all4:10.9 },
        {id:5, name:"St Martin",        population:6685,  u_age_sex:0.0, u_age_sex_occ:0.28, u_all4:4.3  },
        {id:4, name:"Castel",           population:8924,  u_age_sex:0.0, u_age_sex_occ:0.12, u_all4:3.0  },
        {id:2, name:"St Sampson",       population:9042,  u_age_sex:0.0, u_age_sex_occ:0.18, u_all4:2.6  },
        {id:3, name:"Vale",             population:9595,  u_age_sex:0.0, u_age_sex_occ:0.17, u_all4:2.5  },
        {id:1, name:"St Peter Port",    population:19231, u_age_sex:0.0, u_age_sex_occ:0.10, u_all4:0.8  },
      ],
      k_profiles: {
        "3qi":[100,100,100,100,100,100,100,100,99.99,99.99,99.98,99.97,99.97,99.96,99.94,99.93,99.91,99.88,99.87,99.85],
        "4qi":[100,99.56,98.96,98.30,97.37,96.55,95.50,94.60,93.43,92.36,91.68,90.78,89.93,88.89,88.03,87.20,86.42,85.72,84.93,84.12],
        "5qi":[100,95.49,90.58,85.82,81.28,77.02,73.02,69.29,65.88,62.72,59.83,57.21,54.84,52.69,50.72,49.02,47.44,46.04,44.75,43.59],
      }
    },
    jersey: {
      name:"Jersey", population:109417, color:"#f59e0b",
      areas: [
        {id:8, name:"St Mary",     population:2478,  u_age_sex:0.0, u_age_sex_occ:1.37, u_all4:13.64},
        {id:5, name:"St John",     population:3581,  u_age_sex:0.0, u_age_sex_occ:1.01, u_all4:10.22},
        {id:12,name:"St Martin",   population:3959,  u_age_sex:0.0, u_age_sex_occ:0.76, u_all4:8.94 },
        {id:1, name:"Grouville",   population:5401,  u_age_sex:0.0, u_age_sex_occ:0.39, u_all4:6.04 },
        {id:7, name:"Trinity",     population:6031,  u_age_sex:0.0, u_age_sex_occ:0.45, u_all4:5.36 },
        {id:9, name:"St Ouen",     population:6227,  u_age_sex:0.0, u_age_sex_occ:0.40, u_all4:5.32 },
        {id:10,name:"St Peter",    population:6639,  u_age_sex:0.0, u_age_sex_occ:0.30, u_all4:4.79 },
        {id:6, name:"St Lawrence", population:6815,  u_age_sex:0.0, u_age_sex_occ:0.35, u_all4:4.67 },
        {id:3, name:"St Clement",  population:9925,  u_age_sex:0.0, u_age_sex_occ:0.19, u_all4:3.12 },
        {id:2, name:"St Brelade",  population:11012, u_age_sex:0.0, u_age_sex_occ:0.10, u_all4:2.44 },
        {id:11,name:"St Saviour",  population:12703, u_age_sex:0.0, u_age_sex_occ:0.07, u_all4:2.15 },
        {id:4, name:"St Helier",   population:34646, u_age_sex:0.0, u_age_sex_occ:0.02, u_all4:0.49 },
      ],
      k_profiles: {
        "3qi":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],
        "4qi":[100,99.76,99.39,98.82,98.24,97.52,96.80,96.01,95.35,94.69,93.87,93.08,92.28,91.42,90.58,89.90,88.99,87.92,87.26,86.62],
        "5qi":[100,96.62,92.46,88.40,84.65,81.28,77.83,74.85,72.12,69.42,67.01,64.97,62.94,61.04,59.35,57.87,56.38,54.78,53.07,51.51],
      }
    }
  }
};

// Synthetic population data for persona tool (pre-computed cells)
const PERSONA_DATA = {
  iom: {
    areas: {
      "Bride":359,"Santon":749,"Jurby":780,"Maughold":952,"Ballaugh":1041,
      "German":1056,"Lezayre":1230,"Andreas":1400,"Patrick":1487,"Michael":1522,
      "Lonan":1647,"Laxey":1656,"Rushen":1661,"Arbory":1899,"Port St Mary":1989,
      "Marown":2220,"Malew":2367,"Castletown":3206,"Braddan":3404,"Port Erin":3730,
      "Peel":5710,"Ramsey":8288,"Onchan":9039,"Douglas":26677
    },
    age_bands: ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39",
                "40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"],
    occupations: ["Not employed","Managers","Professional","Associate Prof",
                  "Admin/Secretarial","Skilled Trades","Caring/Leisure","Sales/CS","Process/Plant","Elementary"],
  },
  guernsey: {
    areas: {
      "Herm/Jethou":85,"Torteval":1033,"Forest":1564,"St Pierre du Bois":2077,
      "St Andrew":2372,"St Saviour":2840,"St Martin":6685,"Castel":8924,
      "St Sampson":9042,"Vale":9595,"St Peter Port":19231
    },
    age_bands: ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39",
                "40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"],
    occupations: ["Not employed","Managers","Professional","Associate Prof",
                  "Admin/Secretarial","Skilled Trades","Caring/Leisure","Sales/CS","Process/Plant","Elementary"],
  },
  jersey: {
    areas: {
      "St Mary":2478,"St John":3581,"St Martin":3959,"Grouville":5401,
      "Trinity":6031,"St Ouen":6227,"St Peter":6639,"St Lawrence":6815,
      "St Clement":9925,"St Brelade":11012,"St Saviour":12703,"St Helier":34646
    },
    age_bands: ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39",
                "40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"],
    occupations: ["Not employed","Managers","Professional","Associate Prof",
                  "Admin/Secretarial","Skilled Trades","Caring/Leisure","Sales/CS","Process/Plant","Elementary"],
  }
};

const ISLAND_KEYS = ["iom","guernsey","jersey"];
const QI_FIELD = { "3qi":"u_age_sex", "4qi":"u_age_sex_occ", "5qi":"u_all4" };
const QI_LABEL = {
  "3qi":"Age + Sex (within area)",
  "4qi":"Age + Sex + Occupation",
  "5qi":"All 5 Quasi-Identifiers"
};

function riskColor(pct) {
  if (pct >= 20) return "#ef4444";
  if (pct >= 5)  return "#f97316";
  if (pct >= 1)  return "#eab308";
  return "#22c55e";
}

function RiskBadge({ pct }) {
  const color = riskColor(pct);
  const label = pct >= 20?"CRITICAL": pct >= 5?"HIGH": pct >= 1?"ELEVATED":"LOW";
  return (
    <span style={{ background:color, color:"#fff", fontSize:9, fontWeight:700,
      padding:"2px 5px", borderRadius:3, letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:6,
      padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"#94a3b8", marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:600 }}>
          {p.name}: {typeof p.value==="number" ? p.value.toFixed(2)+"%" : p.value}
        </div>
      ))}
    </div>
  );
};

// ── PUBLIC TABS ───────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {ISLAND_KEYS.map(key => {
          const isl = DATA.islands[key];
          const maxArea = [...isl.areas].sort((a,b)=>b.u_age_sex_occ-a.u_age_sex_occ)[0];
          const maxArea5 = [...isl.areas].sort((a,b)=>b.u_all4-a.u_all4)[0];
          return (
            <div key={key} style={{ background:"#1e293b", borderRadius:10, padding:16,
              borderTop:`3px solid ${isl.color}` }}>
              <div style={{ color:isl.color, fontWeight:700, fontSize:14, marginBottom:12 }}>{isl.name}</div>
              {[
                {k:"Population",       v: isl.population.toLocaleString()},
                {k:"Areas/parishes",   v: isl.areas.length},
                {k:"Max unique (4 QI)",v: maxArea.u_age_sex_occ.toFixed(1)+"%",  sub:maxArea.name},
                {k:"Max unique (5 QI)",v: maxArea5.u_all4.toFixed(1)+"%",        sub:maxArea5.name},
              ].map(r => (
                <div key={r.k} style={{ marginBottom:10 }}>
                  <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>{r.k}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:20 }}>{r.v}</span>
                    {r.sub && <span style={{ color:"#64748b", fontSize:11 }}>{r.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4 }}>Island-Level Uniqueness by Quasi-Identifier Set</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>% of each island's population statistically unique on the given combination</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={DATA.island_comparison} margin={{top:4,right:16,bottom:64,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="label" tick={{fill:"#94a3b8",fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
            <YAxis tick={{fill:"#94a3b8",fontSize:11}} tickFormatter={v=>v+"%"}/>
            <Tooltip content={<Tip/>}/>
            <Legend wrapperStyle={{color:"#94a3b8",fontSize:12,paddingTop:8}}/>
            <Bar dataKey="iom"      name="Isle of Man" fill={DATA.islands.iom.color}      radius={[3,3,0,0]}/>
            <Bar dataKey="guernsey" name="Guernsey"    fill={DATA.islands.guernsey.color} radius={[3,3,0,0]}/>
            <Bar dataKey="jersey"   name="Jersey"      fill={DATA.islands.jersey.color}   radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background:"#0f172a", borderRadius:8, padding:14, borderLeft:"3px solid #334155" }}>
        <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
          <strong style={{ color:"#e2e8f0" }}>Key finding:</strong> At 3 quasi-identifiers (area + age + sex),
          all three Crown Dependencies show <strong style={{ color:"#f1f5f9" }}>0% statistical uniqueness</strong>.
          The critical threshold is the addition of a 4th variable, at which point small-population areas become
          acutely vulnerable. The IoM's 24-area granularity makes it structurally more exposed than Jersey (12 areas)
          despite Jersey's larger population.
        </div>
      </div>
    </div>
  );
}

function AreaTab() {
  const [islands, setIslands] = useState(["iom","guernsey","jersey"]);
  const [qi, setQi] = useState("4qi");
  const [sortBy, setSortBy] = useState("uniqueness");
  const field = QI_FIELD[qi];
  const toggleIsland = k => setIslands(prev => prev.includes(k) ? prev.filter(x=>x!==k) : [...prev,k]);
  const allAreas = useMemo(() => {
    let combined = [];
    islands.forEach(key => DATA.islands[key].areas.forEach(a => combined.push({...a,islandKey:key})));
    return combined.sort((a,b) => sortBy==="uniqueness" ? b[field]-a[field] : b.population-a.population);
  }, [islands, qi, sortBy, field]);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Islands</div>
          <div style={{ display:"flex", gap:4 }}>
            {ISLAND_KEYS.map(k => {
              const active = islands.includes(k);
              return <button key={k} onClick={()=>toggleIsland(k)} style={{ padding:"4px 12px", borderRadius:4, border:`1px solid`, borderColor:active?DATA.islands[k].color:"#334155", background:active?DATA.islands[k].color+"22":"#1e293b", color:active?DATA.islands[k].color:"#64748b", fontSize:11, cursor:"pointer", fontWeight:active?600:400 }}>{DATA.islands[k].name}</button>;
            })}
          </div>
        </div>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>QI Set</div>
          <div style={{ display:"flex", gap:4 }}>
            {[["4qi","+ Occupation"],["5qi","All 5 QIs"]].map(([v,l])=>(
              <button key={v} onClick={()=>setQi(v)} style={{ padding:"4px 10px", borderRadius:4, border:"1px solid", borderColor:qi===v?"#60a5fa":"#334155", background:qi===v?"#1d4ed8":"#1e293b", color:qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Sort</div>
          <div style={{ display:"flex", gap:4 }}>
            {[["uniqueness","Uniqueness"],["population","Population"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortBy(v)} style={{ padding:"4px 10px", borderRadius:4, border:"1px solid", borderColor:sortBy===v?"#60a5fa":"#334155", background:sortBy===v?"#1d4ed8":"#1e293b", color:sortBy===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {allAreas.map(a => {
          const pct = a[field];
          const color = DATA.islands[a.islandKey].color;
          return (
            <div key={`${a.islandKey}-${a.id}`} style={{ background:"#1e293b", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:3, height:32, background:color, borderRadius:2, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{a.name}</span>
                  <span style={{ color:"#475569", fontSize:11 }}>{DATA.islands[a.islandKey].name}</span>
                  <RiskBadge pct={pct}/>
                </div>
                <div style={{ background:"#0f172a", borderRadius:3, height:5 }}>
                  <div style={{ width:`${Math.min(pct/Math.max(...allAreas.map(x=>x[field]),1)*100,100)}%`, height:"100%", background:riskColor(pct), borderRadius:3, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ color:riskColor(pct), fontWeight:700, fontSize:20 }}>{pct.toFixed(1)}%</div>
                <div style={{ color:"#475569", fontSize:11 }}>{a.population.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KTab() {
  const [qi, setQi] = useState("4qi");
  const chartData = Array.from({length:20},(_,i)=>({
    k: i+1,
    "Isle of Man": DATA.islands.iom.k_profiles[qi][i],
    "Guernsey":    DATA.islands.guernsey.k_profiles[qi][i],
    "Jersey":      DATA.islands.jersey.k_profiles[qi][i],
  }));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>QI Set</div>
        <div style={{ display:"flex", gap:4 }}>
          {[["3qi","Age + Sex"],["4qi","+ Occupation"],["5qi","All 5 QIs"]].map(([v,l])=>(
            <button key={v} onClick={()=>setQi(v)} style={{ padding:"4px 10px", borderRadius:4, border:"1px solid", borderColor:qi===v?"#60a5fa":"#334155", background:qi===v?"#1d4ed8":"#1e293b", color:qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4 }}>% of Population in Groups of Size ≥ k</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>k=1 intercept = uniqueness %. Jersey's larger population gives structural k-anonymity advantage.</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{top:8,right:24,bottom:24,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="k" tick={{fill:"#94a3b8",fontSize:11}} label={{value:"k (minimum group size)",position:"insideBottom",offset:-8,fill:"#64748b",fontSize:11}}/>
            <YAxis tick={{fill:"#94a3b8",fontSize:11}} tickFormatter={v=>v+"%"} domain={[0,100]}/>
            <Tooltip content={<Tip/>} formatter={(v)=>v.toFixed(2)+"%"}/>
            <Legend wrapperStyle={{color:"#94a3b8",fontSize:12}}/>
            {ISLAND_KEYS.map(key=>(
              <Line key={key} type="monotone" dataKey={DATA.islands[key].name} stroke={DATA.islands[key].color} strokeWidth={2} dot={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── RESTRICTED TOOLS ──────────────────────────────────────────────────────────
function PersonaTool() {
  const [island, setIsland] = useState("iom");
  const [area, setArea] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [sex, setSex] = useState("");
  const [occupation, setOccupation] = useState("");
  const [result, setResult] = useState(null);

  const pd = PERSONA_DATA[island];
  const areaPop = area ? pd.areas[area] : null;

  const compute = () => {
    if (!area || !ageBand || !sex || !occupation) return;
    const pop = pd.areas[area];
    // Estimate cell size from synthetic population proportions
    const ageFrac = 1/18;
    const sexFrac = 0.5;
    // Occupation fractions (rough)
    const occFracs = {
      "Not employed":0.46,"Managers":0.08,"Professional":0.16,"Associate Prof":0.09,
      "Admin/Secretarial":0.07,"Skilled Trades":0.06,"Caring/Leisure":0.05,
      "Sales/CS":0.04,"Process/Plant":0.02,"Elementary":0.05
    };
    const occFrac = occFracs[occupation] || 0.05;
    const estimated = Math.round(pop * ageFrac * sexFrac * occFrac * 18 * 0.7);
    const uniqueness = estimated <= 1;
    const nearUnique = estimated <= 3;
    setResult({ pop, estimated: Math.max(1, estimated), uniqueness, nearUnique, area, ageBand, sex, occupation, island: DATA.islands[island].name });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:15, marginBottom:4 }}>Persona Re-identification Tool</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:20 }}>
          Enter demographic characteristics. The tool estimates how many people share this combination — and whether they are uniquely identifiable.
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Island</div>
            <select value={island} onChange={e=>{setIsland(e.target.value);setArea("");}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              {ISLAND_KEYS.map(k=><option key={k} value={k}>{DATA.islands[k].name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Area / Parish</div>
            <select value={area} onChange={e=>setArea(e.target.value)}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select area...</option>
              {Object.entries(pd.areas).sort((a,b)=>a[1]-b[1]).map(([name,pop])=>(
                <option key={name} value={name}>{name} (pop {pop.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Age Band</div>
            <select value={ageBand} onChange={e=>setAgeBand(e.target.value)}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select age band...</option>
              {pd.age_bands.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Sex</div>
            <select value={sex} onChange={e=>setSex(e.target.value)}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Occupation (SOC Level 1)</div>
            <select value={occupation} onChange={e=>setOccupation(e.target.value)}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select occupation...</option>
              {pd.occupations.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <button onClick={compute} disabled={!area||!ageBand||!sex||!occupation}
          style={{ padding:"10px 24px", background: (!area||!ageBand||!sex||!occupation)?"#1e3a5f":"#1d4ed8", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:(!area||!ageBand||!sex||!occupation)?"not-allowed":"pointer" }}>
          Estimate Re-identification Risk
        </button>
      </div>

      {result && (
        <div style={{ background: result.uniqueness?"#450a0a": result.nearUnique?"#431407":"#1e293b",
          borderRadius:10, padding:24,
          border:`2px solid ${result.uniqueness?"#ef4444":result.nearUnique?"#f97316":"#334155"}` }}>
          <div style={{ color: result.uniqueness?"#ef4444":result.nearUnique?"#f97316":"#e2e8f0",
            fontWeight:800, fontSize:22, marginBottom:8 }}>
            {result.uniqueness ? "⚠ UNIQUE INDIVIDUAL" : result.nearUnique ? "⚠ NEAR-UNIQUE (HIGH RISK)" : "Group identified"}
          </div>
          <div style={{ color:"#94a3b8", fontSize:13, lineHeight:1.8, marginBottom:16 }}>
            A <strong style={{color:"#f1f5f9"}}>{result.sex}</strong> aged{" "}
            <strong style={{color:"#f1f5f9"}}>{result.ageBand}</strong> working as{" "}
            <strong style={{color:"#f1f5f9"}}>{result.occupation}</strong> in{" "}
            <strong style={{color:"#f1f5f9"}}>{result.area}</strong>, {result.island}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            {[
              {k:"Area population",   v: result.pop.toLocaleString()},
              {k:"Estimated matches", v: result.estimated === 1 ? "1 person" : `~${result.estimated} people`},
              {k:"Risk level",        v: result.uniqueness?"CRITICAL":result.nearUnique?"HIGH":"MODERATE"},
            ].map(r=>(
              <div key={r.k} style={{ background:"#0f172a", borderRadius:6, padding:12 }}>
                <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase" }}>{r.k}</div>
                <div style={{ color: r.k==="Risk level"?riskColor(result.uniqueness?100:result.nearUnique?10:2):"#f1f5f9",
                  fontWeight:700, fontSize:18 }}>{r.v}</div>
              </div>
            ))}
          </div>
          {result.uniqueness && (
            <div style={{ color:"#fca5a5", fontSize:12, lineHeight:1.7 }}>
              <strong>This individual is statistically unique.</strong> No other person in{" "}
              {result.area} shares this combination of area, age, sex and occupation.
              Any dataset containing these fields — even without a name — uniquely identifies this person.
              A LinkedIn search would likely confirm their identity within minutes.
            </div>
          )}
          {!result.uniqueness && result.nearUnique && (
            <div style={{ color:"#fdba74", fontSize:12, lineHeight:1.7 }}>
              <strong>This is a group of {result.estimated} people.</strong> One additional data point
              — household size, year of birth, or a health condition — would likely reduce this to a unique individual.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttackSimulator() {
  const [step, setStep] = useState(0);
  const [island, setIsland] = useState("iom");
  const [area, setArea] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [sex, setSex] = useState("");
  const [occupation, setOccupation] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);

  const pd = PERSONA_DATA[island];

  const runSimulation = async () => {
    if (!area || !ageBand || !sex || !occupation) return;
    setRunning(true);
    setSteps([]);
    setStep(0);

    const pop = pd.areas[area];
    const ageFrac = 1/18;
    const sexFrac = 0.5;
    const occFracs = { "Not employed":0.46,"Managers":0.08,"Professional":0.16,"Associate Prof":0.09,"Admin/Secretarial":0.07,"Skilled Trades":0.06,"Caring/Leisure":0.05,"Sales/CS":0.04,"Process/Plant":0.02,"Elementary":0.05 };
    const occFrac = occFracs[occupation] || 0.05;

    const n1 = pop;
    const n2 = Math.round(pop * ageFrac * 18 * 0.85);
    const n3 = Math.round(n2 * sexFrac);
    const n4 = Math.max(1, Math.round(n3 * occFrac / 0.46 * (1 - 0.46)));
    const n5 = Math.max(1, Math.round(n4 * 0.4));

    const simSteps = [
      { label:"Step 1 — Area identified", desc:`Start with ${area}, ${DATA.islands[island].name}`, candidates:n1, source:"Census Table 6.1 — publicly available", color:"#64748b" },
      { label:"Step 2 — Age band applied", desc:`Filter to ${ageBand} age group`, candidates:n2, source:"Census Table 4.4.1 — publicly available", color:"#eab308" },
      { label:"Step 3 — Sex applied", desc:`Filter to ${sex}`, candidates:n3, source:"Census Table 3.1 — publicly available", color:"#f97316" },
      { label:"Step 4 — Occupation applied", desc:`Filter to ${occupation}`, candidates:n4, source:"Census employment tables — publicly available", color: n4<=3?"#ef4444":"#f97316" },
      { label:"Step 5 — LinkedIn cross-reference", desc:"Search LinkedIn for matching profile", candidates:n5, source:"linkedin.com — public auxiliary data", color: n5<=1?"#ef4444":"#f97316" },
    ];

    for (let i = 0; i < simSteps.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setSteps(prev => [...prev, simSteps[i]]);
      setStep(i+1);
    }
    setRunning(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:15, marginBottom:4 }}>Attack Chain Simulator</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:20 }}>
          Simulates a step-by-step re-identification attack using only publicly available data sources. No hacking. No breach. Just open data and a spreadsheet.
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Island</div>
            <select value={island} onChange={e=>{setIsland(e.target.value);setArea("");setSteps([]);}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              {ISLAND_KEYS.map(k=><option key={k} value={k}>{DATA.islands[k].name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Area</div>
            <select value={area} onChange={e=>{setArea(e.target.value);setSteps([]);}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select area...</option>
              {Object.entries(pd.areas).sort((a,b)=>a[1]-b[1]).map(([name,pop])=>(
                <option key={name} value={name}>{name} (pop {pop.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Age Band</div>
            <select value={ageBand} onChange={e=>{setAgeBand(e.target.value);setSteps([]);}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select...</option>
              {pd.age_bands.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Sex</div>
            <select value={sex} onChange={e=>{setSex(e.target.value);setSteps([]);}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select...</option>
              <option>Male</option><option>Female</option>
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Occupation</div>
            <select value={occupation} onChange={e=>{setOccupation(e.target.value);setSteps([]);}}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13 }}>
              <option value="">Select...</option>
              {pd.occupations.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button onClick={runSimulation} disabled={running||!area||!ageBand||!sex||!occupation}
          style={{ padding:"10px 24px", background:running||!area||!ageBand||!sex||!occupation?"#1e3a5f":"#7c3aed", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer" }}>
          {running ? "Running attack simulation…" : "Run Attack Simulation"}
        </button>
      </div>

      {steps.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ background:"#1e293b", borderRadius:8, padding:16,
              borderLeft:`3px solid ${s.color}`, animation:"fadeIn 0.3s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{s.label}</div>
                  <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{s.desc}</div>
                  <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>Source: {s.source}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                  <div style={{ color:s.color, fontWeight:800, fontSize:28 }}>
                    {s.candidates === 1 ? "1" : `~${s.candidates}`}
                  </div>
                  <div style={{ color:"#64748b", fontSize:11 }}>
                    {s.candidates === 1 ? "person remaining" : "candidates remaining"}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!running && steps.length === 5 && (
            <div style={{ background: steps[4].candidates <= 1 ? "#450a0a" : "#431407",
              borderRadius:8, padding:16, border:`2px solid ${steps[4].candidates<=1?"#ef4444":"#f97316"}` }}>
              <div style={{ color: steps[4].candidates<=1?"#ef4444":"#f97316", fontWeight:800, fontSize:16, marginBottom:8 }}>
                {steps[4].candidates <= 1 ? "⚠ Re-identification complete" : `⚠ ${steps[4].candidates} candidates remain`}
              </div>
              <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
                {steps[4].candidates <= 1
                  ? "This individual has been re-identified using only publicly available data sources. No data breach occurred. No specialist tools were used. Time to complete: under 5 minutes."
                  : `With ${steps[4].candidates} candidates, one additional data point — year of birth, health condition, or household size — would likely complete the identification.`
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── JERSEY DATA JOIN TOOL ─────────────────────────────────────────────────────
const JERSEY_JOIN_DATA = [{"parish":"Grouville","age_band":"15-19","broad_age":"16-24","population":300,"gay_lesbian":5,"bisexual":8,"poor_health":4,"fair_health":14,"longstanding_condition":42,"gender_diff_birth":1},{"parish":"Grouville","age_band":"20-24","broad_age":"16-24","population":271,"gay_lesbian":4,"bisexual":7,"poor_health":3,"fair_health":13,"longstanding_condition":38,"gender_diff_birth":1},{"parish":"Grouville","age_band":"25-29","broad_age":"25-34","population":184,"gay_lesbian":4,"bisexual":3,"poor_health":3,"fair_health":12,"longstanding_condition":28,"gender_diff_birth":1},{"parish":"Grouville","age_band":"30-34","broad_age":"25-34","population":213,"gay_lesbian":4,"bisexual":3,"poor_health":3,"fair_health":14,"longstanding_condition":32,"gender_diff_birth":1},{"parish":"Grouville","age_band":"35-39","broad_age":"35-44","population":326,"gay_lesbian":6,"bisexual":2,"poor_health":7,"fair_health":27,"longstanding_condition":52,"gender_diff_birth":1},{"parish":"Grouville","age_band":"40-44","broad_age":"35-44","population":355,"gay_lesbian":6,"bisexual":2,"poor_health":8,"fair_health":30,"longstanding_condition":57,"gender_diff_birth":1},{"parish":"Grouville","age_band":"45-49","broad_age":"45-54","population":409,"gay_lesbian":5,"bisexual":1,"poor_health":16,"fair_health":46,"longstanding_condition":82,"gender_diff_birth":1},{"parish":"Grouville","age_band":"50-54","broad_age":"45-54","population":461,"gay_lesbian":6,"bisexual":2,"poor_health":19,"fair_health":52,"longstanding_condition":92,"gender_diff_birth":1},{"parish":"Grouville","age_band":"55-59","broad_age":"55-64","population":408,"gay_lesbian":4,"bisexual":1,"poor_health":28,"fair_health":62,"longstanding_condition":110,"gender_diff_birth":1},{"parish":"Grouville","age_band":"60-64","broad_age":"55-64","population":372,"gay_lesbian":4,"bisexual":1,"poor_health":26,"fair_health":57,"longstanding_condition":100,"gender_diff_birth":1},{"parish":"Grouville","age_band":"65-69","broad_age":"65+","population":339,"gay_lesbian":1,"bisexual":0,"poor_health":34,"fair_health":82,"longstanding_condition":136,"gender_diff_birth":0},{"parish":"Grouville","age_band":"70-74","broad_age":"65+","population":308,"gay_lesbian":1,"bisexual":0,"poor_health":31,"fair_health":75,"longstanding_condition":123,"gender_diff_birth":0},{"parish":"Grouville","age_band":"75-79","broad_age":"65+","population":234,"gay_lesbian":1,"bisexual":0,"poor_health":23,"fair_health":57,"longstanding_condition":94,"gender_diff_birth":0},{"parish":"Grouville","age_band":"80+","broad_age":"65+","population":374,"gay_lesbian":1,"bisexual":0,"poor_health":37,"fair_health":91,"longstanding_condition":150,"gender_diff_birth":0},{"parish":"St Brelade","age_band":"15-19","broad_age":"16-24","population":540,"gay_lesbian":9,"bisexual":14,"poor_health":7,"fair_health":26,"longstanding_condition":76,"gender_diff_birth":3},{"parish":"St Brelade","age_band":"20-24","broad_age":"16-24","population":573,"gay_lesbian":9,"bisexual":15,"poor_health":7,"fair_health":28,"longstanding_condition":80,"gender_diff_birth":3},{"parish":"St Brelade","age_band":"25-29","broad_age":"25-34","population":452,"gay_lesbian":9,"bisexual":6,"poor_health":7,"fair_health":29,"longstanding_condition":68,"gender_diff_birth":2},{"parish":"St Brelade","age_band":"30-34","broad_age":"25-34","population":513,"gay_lesbian":10,"bisexual":7,"poor_health":8,"fair_health":33,"longstanding_condition":77,"gender_diff_birth":2},{"parish":"St Brelade","age_band":"35-39","broad_age":"35-44","population":696,"gay_lesbian":12,"bisexual":4,"poor_health":16,"fair_health":58,"longstanding_condition":111,"gender_diff_birth":1},{"parish":"St Brelade","age_band":"40-44","broad_age":"35-44","population":690,"gay_lesbian":12,"bisexual":4,"poor_health":16,"fair_health":57,"longstanding_condition":110,"gender_diff_birth":1},{"parish":"St Brelade","age_band":"45-49","broad_age":"45-54","population":722,"gay_lesbian":9,"bisexual":2,"poor_health":29,"fair_health":81,"longstanding_condition":144,"gender_diff_birth":2},{"parish":"St Brelade","age_band":"50-54","broad_age":"45-54","population":944,"gay_lesbian":12,"bisexual":3,"poor_health":38,"fair_health":106,"longstanding_condition":189,"gender_diff_birth":2},{"parish":"St Brelade","age_band":"55-59","broad_age":"55-64","population":910,"gay_lesbian":9,"bisexual":3,"poor_health":63,"fair_health":139,"longstanding_condition":246,"gender_diff_birth":1},{"parish":"St Brelade","age_band":"60-64","broad_age":"55-64","population":802,"gay_lesbian":8,"bisexual":2,"poor_health":55,"fair_health":123,"longstanding_condition":217,"gender_diff_birth":1},{"parish":"St Brelade","age_band":"65-69","broad_age":"65+","population":662,"gay_lesbian":2,"bisexual":1,"poor_health":66,"fair_health":161,"longstanding_condition":265,"gender_diff_birth":0},{"parish":"St Brelade","age_band":"70-74","broad_age":"65+","population":625,"gay_lesbian":2,"bisexual":1,"poor_health":62,"fair_health":152,"longstanding_condition":250,"gender_diff_birth":0},{"parish":"St Brelade","age_band":"75-79","broad_age":"65+","population":459,"gay_lesbian":2,"bisexual":0,"poor_health":46,"fair_health":111,"longstanding_condition":184,"gender_diff_birth":0},{"parish":"St Brelade","age_band":"80+","broad_age":"65+","population":872,"gay_lesbian":3,"bisexual":1,"poor_health":87,"fair_health":212,"longstanding_condition":349,"gender_diff_birth":1},{"parish":"St Clement","age_band":"15-19","broad_age":"16-24","population":619,"gay_lesbian":10,"bisexual":16,"poor_health":7,"fair_health":30,"longstanding_condition":87,"gender_diff_birth":3},{"parish":"St Clement","age_band":"20-24","broad_age":"16-24","population":528,"gay_lesbian":8,"bisexual":14,"poor_health":6,"fair_health":25,"longstanding_condition":74,"gender_diff_birth":3},{"parish":"St Clement","age_band":"25-29","broad_age":"25-34","population":475,"gay_lesbian":10,"bisexual":7,"poor_health":8,"fair_health":31,"longstanding_condition":71,"gender_diff_birth":2},{"parish":"St Clement","age_band":"30-34","broad_age":"25-34","population":535,"gay_lesbian":11,"bisexual":7,"poor_health":9,"fair_health":35,"longstanding_condition":80,"gender_diff_birth":2},{"parish":"St Clement","age_band":"35-39","broad_age":"35-44","population":633,"gay_lesbian":11,"bisexual":4,"poor_health":15,"fair_health":53,"longstanding_condition":101,"gender_diff_birth":1},{"parish":"St Clement","age_band":"40-44","broad_age":"35-44","population":700,"gay_lesbian":13,"bisexual":4,"poor_health":16,"fair_health":58,"longstanding_condition":112,"gender_diff_birth":1},{"parish":"St Clement","age_band":"45-49","broad_age":"45-54","population":699,"gay_lesbian":9,"bisexual":2,"poor_health":28,"fair_health":79,"longstanding_condition":140,"gender_diff_birth":2},{"parish":"St Clement","age_band":"50-54","broad_age":"45-54","population":743,"gay_lesbian":10,"bisexual":2,"poor_health":30,"fair_health":84,"longstanding_condition":149,"gender_diff_birth":2},{"parish":"St Clement","age_band":"55-59","broad_age":"55-64","population":822,"gay_lesbian":8,"bisexual":2,"poor_health":57,"fair_health":126,"longstanding_condition":222,"gender_diff_birth":1},{"parish":"St Clement","age_band":"60-64","broad_age":"55-64","population":649,"gay_lesbian":7,"bisexual":2,"poor_health":45,"fair_health":99,"longstanding_condition":175,"gender_diff_birth":1},{"parish":"St Clement","age_band":"65-69","broad_age":"65+","population":490,"gay_lesbian":2,"bisexual":0,"poor_health":49,"fair_health":119,"longstanding_condition":196,"gender_diff_birth":0},{"parish":"St Clement","age_band":"70-74","broad_age":"65+","population":488,"gay_lesbian":2,"bisexual":0,"poor_health":48,"fair_health":118,"longstanding_condition":195,"gender_diff_birth":0},{"parish":"St Clement","age_band":"75-79","broad_age":"65+","population":340,"gay_lesbian":1,"bisexual":0,"poor_health":34,"fair_health":82,"longstanding_condition":136,"gender_diff_birth":0},{"parish":"St Clement","age_band":"80+","broad_age":"65+","population":525,"gay_lesbian":2,"bisexual":1,"poor_health":52,"fair_health":127,"longstanding_condition":210,"gender_diff_birth":0},{"parish":"St Helier","age_band":"15-19","broad_age":"16-24","population":1464,"gay_lesbian":23,"bisexual":39,"poor_health":18,"fair_health":71,"longstanding_condition":205,"gender_diff_birth":7},{"parish":"St Helier","age_band":"20-24","broad_age":"16-24","population":2123,"gay_lesbian":34,"bisexual":56,"poor_health":26,"fair_health":102,"longstanding_condition":297,"gender_diff_birth":10},{"parish":"St Helier","age_band":"25-29","broad_age":"25-34","population":2935,"gay_lesbian":59,"bisexual":41,"poor_health":48,"fair_health":190,"longstanding_condition":440,"gender_diff_birth":11},{"parish":"St Helier","age_band":"30-34","broad_age":"25-34","population":3195,"gay_lesbian":64,"bisexual":44,"poor_health":52,"fair_health":206,"longstanding_condition":479,"gender_diff_birth":12},{"parish":"St Helier","age_band":"35-39","broad_age":"35-44","population":3070,"gay_lesbian":55,"bisexual":19,"poor_health":70,"fair_health":256,"longstanding_condition":491,"gender_diff_birth":5},{"parish":"St Helier","age_band":"40-44","broad_age":"35-44","population":2773,"gay_lesbian":50,"bisexual":17,"poor_health":64,"fair_health":231,"longstanding_condition":444,"gender_diff_birth":4},{"parish":"St Helier","age_band":"45-49","broad_age":"45-54","population":2638,"gay_lesbian":35,"bisexual":9,"poor_health":106,"fair_health":297,"longstanding_condition":528,"gender_diff_birth":6},{"parish":"St Helier","age_band":"50-54","broad_age":"45-54","population":2907,"gay_lesbian":38,"bisexual":10,"poor_health":117,"fair_health":327,"longstanding_condition":581,"gender_diff_birth":7},{"parish":"St Helier","age_band":"55-59","broad_age":"55-64","population":2755,"gay_lesbian":28,"bisexual":8,"poor_health":190,"fair_health":422,"longstanding_condition":744,"gender_diff_birth":4},{"parish":"St Helier","age_band":"60-64","broad_age":"55-64","population":2183,"gay_lesbian":23,"bisexual":6,"poor_health":150,"fair_health":334,"longstanding_condition":589,"gender_diff_birth":3},{"parish":"St Helier","age_band":"65-69","broad_age":"65+","population":1618,"gay_lesbian":6,"bisexual":2,"poor_health":161,"fair_health":392,"longstanding_condition":647,"gender_diff_birth":1},{"parish":"St Helier","age_band":"70-74","broad_age":"65+","population":1228,"gay_lesbian":5,"bisexual":1,"poor_health":122,"fair_health":298,"longstanding_condition":491,"gender_diff_birth":1},{"parish":"St Helier","age_band":"75-79","broad_age":"65+","population":875,"gay_lesbian":3,"bisexual":1,"poor_health":87,"fair_health":212,"longstanding_condition":350,"gender_diff_birth":1},{"parish":"St Helier","age_band":"80+","broad_age":"65+","population":1262,"gay_lesbian":5,"bisexual":1,"poor_health":125,"fair_health":306,"longstanding_condition":505,"gender_diff_birth":1},{"parish":"St John","age_band":"15-19","broad_age":"16-24","population":175,"gay_lesbian":3,"bisexual":5,"poor_health":2,"fair_health":8,"longstanding_condition":24,"gender_diff_birth":1},{"parish":"St John","age_band":"20-24","broad_age":"16-24","population":174,"gay_lesbian":3,"bisexual":5,"poor_health":2,"fair_health":8,"longstanding_condition":24,"gender_diff_birth":1},{"parish":"St John","age_band":"25-29","broad_age":"25-34","population":147,"gay_lesbian":3,"bisexual":2,"poor_health":2,"fair_health":9,"longstanding_condition":22,"gender_diff_birth":1},{"parish":"St John","age_band":"30-34","broad_age":"25-34","population":120,"gay_lesbian":2,"bisexual":2,"poor_health":2,"fair_health":8,"longstanding_condition":18,"gender_diff_birth":0},{"parish":"St John","age_band":"35-39","broad_age":"35-44","population":166,"gay_lesbian":3,"bisexual":1,"poor_health":4,"fair_health":14,"longstanding_condition":27,"gender_diff_birth":0},{"parish":"St John","age_band":"40-44","broad_age":"35-44","population":213,"gay_lesbian":4,"bisexual":1,"poor_health":5,"fair_health":18,"longstanding_condition":34,"gender_diff_birth":0},{"parish":"St John","age_band":"45-49","broad_age":"45-54","population":221,"gay_lesbian":3,"bisexual":1,"poor_health":9,"fair_health":25,"longstanding_condition":44,"gender_diff_birth":0},{"parish":"St John","age_band":"50-54","broad_age":"45-54","population":262,"gay_lesbian":3,"bisexual":1,"poor_health":11,"fair_health":29,"longstanding_condition":52,"gender_diff_birth":1},{"parish":"St John","age_band":"55-59","broad_age":"55-64","population":274,"gay_lesbian":3,"bisexual":1,"poor_health":19,"fair_health":42,"longstanding_condition":74,"gender_diff_birth":0},{"parish":"St John","age_band":"60-64","broad_age":"55-64","population":205,"gay_lesbian":2,"bisexual":1,"poor_health":14,"fair_health":31,"longstanding_condition":55,"gender_diff_birth":0},{"parish":"St John","age_band":"65-69","broad_age":"65+","population":146,"gay_lesbian":1,"bisexual":0,"poor_health":15,"fair_health":35,"longstanding_condition":58,"gender_diff_birth":0},{"parish":"St John","age_band":"70-74","broad_age":"65+","population":162,"gay_lesbian":1,"bisexual":0,"poor_health":16,"fair_health":39,"longstanding_condition":65,"gender_diff_birth":0},{"parish":"St John","age_band":"75-79","broad_age":"65+","population":135,"gay_lesbian":1,"bisexual":0,"poor_health":13,"fair_health":33,"longstanding_condition":54,"gender_diff_birth":0},{"parish":"St John","age_band":"80+","broad_age":"65+","population":179,"gay_lesbian":1,"bisexual":0,"poor_health":18,"fair_health":43,"longstanding_condition":72,"gender_diff_birth":0},{"parish":"St Lawrence","age_band":"15-19","broad_age":"16-24","population":311,"gay_lesbian":5,"bisexual":8,"poor_health":4,"fair_health":15,"longstanding_condition":44,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"20-24","broad_age":"16-24","population":265,"gay_lesbian":4,"bisexual":7,"poor_health":3,"fair_health":13,"longstanding_condition":37,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"25-29","broad_age":"25-34","population":235,"gay_lesbian":5,"bisexual":3,"poor_health":4,"fair_health":15,"longstanding_condition":35,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"30-34","broad_age":"25-34","population":268,"gay_lesbian":5,"bisexual":4,"poor_health":4,"fair_health":17,"longstanding_condition":40,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"35-39","broad_age":"35-44","population":360,"gay_lesbian":6,"bisexual":2,"poor_health":8,"fair_health":30,"longstanding_condition":58,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"40-44","broad_age":"35-44","population":399,"gay_lesbian":7,"bisexual":2,"poor_health":9,"fair_health":33,"longstanding_condition":64,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"45-49","broad_age":"45-54","population":429,"gay_lesbian":6,"bisexual":1,"poor_health":17,"fair_health":48,"longstanding_condition":86,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"50-54","broad_age":"45-54","population":460,"gay_lesbian":6,"bisexual":2,"poor_health":18,"fair_health":52,"longstanding_condition":92,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"55-59","broad_age":"55-64","population":455,"gay_lesbian":5,"bisexual":1,"poor_health":31,"fair_health":70,"longstanding_condition":123,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"60-64","broad_age":"55-64","population":391,"gay_lesbian":4,"bisexual":1,"poor_health":27,"fair_health":60,"longstanding_condition":106,"gender_diff_birth":1},{"parish":"St Lawrence","age_band":"65-69","broad_age":"65+","population":316,"gay_lesbian":1,"bisexual":0,"poor_health":31,"fair_health":77,"longstanding_condition":126,"gender_diff_birth":0},{"parish":"St Lawrence","age_band":"70-74","broad_age":"65+","population":300,"gay_lesbian":1,"bisexual":0,"poor_health":30,"fair_health":73,"longstanding_condition":120,"gender_diff_birth":0},{"parish":"St Lawrence","age_band":"75-79","broad_age":"65+","population":176,"gay_lesbian":1,"bisexual":0,"poor_health":17,"fair_health":43,"longstanding_condition":70,"gender_diff_birth":0},{"parish":"St Lawrence","age_band":"80+","broad_age":"65+","population":330,"gay_lesbian":1,"bisexual":0,"poor_health":33,"fair_health":80,"longstanding_condition":132,"gender_diff_birth":0},{"parish":"St Martin","age_band":"15-19","broad_age":"16-24","population":227,"gay_lesbian":4,"bisexual":6,"poor_health":3,"fair_health":11,"longstanding_condition":32,"gender_diff_birth":1},{"parish":"St Martin","age_band":"20-24","broad_age":"16-24","population":207,"gay_lesbian":3,"bisexual":6,"poor_health":2,"fair_health":10,"longstanding_condition":29,"gender_diff_birth":1},{"parish":"St Martin","age_band":"25-29","broad_age":"25-34","population":148,"gay_lesbian":3,"bisexual":2,"poor_health":2,"fair_health":10,"longstanding_condition":22,"gender_diff_birth":1},{"parish":"St Martin","age_band":"30-34","broad_age":"25-34","population":187,"gay_lesbian":4,"bisexual":3,"poor_health":3,"fair_health":12,"longstanding_condition":28,"gender_diff_birth":1},{"parish":"St Martin","age_band":"35-39","broad_age":"35-44","population":224,"gay_lesbian":4,"bisexual":1,"poor_health":5,"fair_health":19,"longstanding_condition":36,"gender_diff_birth":0},{"parish":"St Martin","age_band":"40-44","broad_age":"35-44","population":268,"gay_lesbian":5,"bisexual":2,"poor_health":6,"fair_health":22,"longstanding_condition":43,"gender_diff_birth":0},{"parish":"St Martin","age_band":"45-49","broad_age":"45-54","population":315,"gay_lesbian":4,"bisexual":1,"poor_health":13,"fair_health":35,"longstanding_condition":63,"gender_diff_birth":1},{"parish":"St Martin","age_band":"50-54","broad_age":"45-54","population":331,"gay_lesbian":4,"bisexual":1,"poor_health":13,"fair_health":37,"longstanding_condition":66,"gender_diff_birth":1},{"parish":"St Martin","age_band":"55-59","broad_age":"55-64","population":351,"gay_lesbian":4,"bisexual":1,"poor_health":24,"fair_health":54,"longstanding_condition":95,"gender_diff_birth":1},{"parish":"St Martin","age_band":"60-64","broad_age":"55-64","population":287,"gay_lesbian":3,"bisexual":1,"poor_health":20,"fair_health":44,"longstanding_condition":77,"gender_diff_birth":0},{"parish":"St Martin","age_band":"65-69","broad_age":"65+","population":212,"gay_lesbian":1,"bisexual":0,"poor_health":21,"fair_health":51,"longstanding_condition":85,"gender_diff_birth":0},{"parish":"St Martin","age_band":"70-74","broad_age":"65+","population":216,"gay_lesbian":1,"bisexual":0,"poor_health":21,"fair_health":52,"longstanding_condition":86,"gender_diff_birth":0},{"parish":"St Martin","age_band":"75-79","broad_age":"65+","population":167,"gay_lesbian":1,"bisexual":0,"poor_health":17,"fair_health":41,"longstanding_condition":67,"gender_diff_birth":0},{"parish":"St Martin","age_band":"80+","broad_age":"65+","population":226,"gay_lesbian":1,"bisexual":0,"poor_health":22,"fair_health":55,"longstanding_condition":90,"gender_diff_birth":0},{"parish":"St Mary","age_band":"15-19","broad_age":"16-24","population":101,"gay_lesbian":2,"bisexual":3,"poor_health":1,"fair_health":5,"longstanding_condition":14,"gender_diff_birth":0},{"parish":"St Mary","age_band":"20-24","broad_age":"16-24","population":96,"gay_lesbian":2,"bisexual":3,"poor_health":1,"fair_health":5,"longstanding_condition":13,"gender_diff_birth":0},{"parish":"St Mary","age_band":"25-29","broad_age":"25-34","population":69,"gay_lesbian":1,"bisexual":1,"poor_health":1,"fair_health":4,"longstanding_condition":10,"gender_diff_birth":0},{"parish":"St Mary","age_band":"30-34","broad_age":"25-34","population":97,"gay_lesbian":2,"bisexual":1,"poor_health":2,"fair_health":6,"longstanding_condition":15,"gender_diff_birth":0},{"parish":"St Mary","age_band":"35-39","broad_age":"35-44","population":94,"gay_lesbian":2,"bisexual":1,"poor_health":2,"fair_health":8,"longstanding_condition":15,"gender_diff_birth":0},{"parish":"St Mary","age_band":"40-44","broad_age":"35-44","population":143,"gay_lesbian":3,"bisexual":1,"poor_health":3,"fair_health":12,"longstanding_condition":23,"gender_diff_birth":0},{"parish":"St Mary","age_band":"45-49","broad_age":"45-54","population":139,"gay_lesbian":2,"bisexual":0,"poor_health":6,"fair_health":16,"longstanding_condition":28,"gender_diff_birth":0},{"parish":"St Mary","age_band":"50-54","broad_age":"45-54","population":169,"gay_lesbian":2,"bisexual":1,"poor_health":7,"fair_health":19,"longstanding_condition":34,"gender_diff_birth":0},{"parish":"St Mary","age_band":"55-59","broad_age":"55-64","population":141,"gay_lesbian":1,"bisexual":0,"poor_health":10,"fair_health":22,"longstanding_condition":38,"gender_diff_birth":0},{"parish":"St Mary","age_band":"60-64","broad_age":"55-64","population":117,"gay_lesbian":1,"bisexual":0,"poor_health":8,"fair_health":18,"longstanding_condition":32,"gender_diff_birth":0},{"parish":"St Mary","age_band":"65-69","broad_age":"65+","population":106,"gay_lesbian":0,"bisexual":0,"poor_health":11,"fair_health":26,"longstanding_condition":42,"gender_diff_birth":0},{"parish":"St Mary","age_band":"70-74","broad_age":"65+","population":104,"gay_lesbian":0,"bisexual":0,"poor_health":10,"fair_health":25,"longstanding_condition":42,"gender_diff_birth":0},{"parish":"St Mary","age_band":"75-79","broad_age":"65+","population":61,"gay_lesbian":0,"bisexual":0,"poor_health":6,"fair_health":15,"longstanding_condition":24,"gender_diff_birth":0},{"parish":"St Mary","age_band":"80+","broad_age":"65+","population":88,"gay_lesbian":0,"bisexual":0,"poor_health":9,"fair_health":21,"longstanding_condition":35,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"15-19","broad_age":"16-24","population":207,"gay_lesbian":3,"bisexual":6,"poor_health":2,"fair_health":10,"longstanding_condition":29,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"20-24","broad_age":"16-24","population":202,"gay_lesbian":3,"bisexual":5,"poor_health":2,"fair_health":10,"longstanding_condition":28,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"25-29","broad_age":"25-34","population":170,"gay_lesbian":3,"bisexual":2,"poor_health":3,"fair_health":11,"longstanding_condition":26,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"30-34","broad_age":"25-34","population":190,"gay_lesbian":4,"bisexual":3,"poor_health":3,"fair_health":12,"longstanding_condition":28,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"35-39","broad_age":"35-44","population":247,"gay_lesbian":4,"bisexual":2,"poor_health":6,"fair_health":21,"longstanding_condition":40,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"40-44","broad_age":"35-44","population":302,"gay_lesbian":5,"bisexual":2,"poor_health":7,"fair_health":25,"longstanding_condition":48,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"45-49","broad_age":"45-54","population":327,"gay_lesbian":4,"bisexual":1,"poor_health":13,"fair_health":37,"longstanding_condition":65,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"50-54","broad_age":"45-54","population":383,"gay_lesbian":5,"bisexual":1,"poor_health":15,"fair_health":43,"longstanding_condition":77,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"55-59","broad_age":"55-64","population":353,"gay_lesbian":4,"bisexual":1,"poor_health":24,"fair_health":54,"longstanding_condition":95,"gender_diff_birth":1},{"parish":"St Ouen","age_band":"60-64","broad_age":"55-64","population":297,"gay_lesbian":3,"bisexual":1,"poor_health":20,"fair_health":45,"longstanding_condition":80,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"65-69","broad_age":"65+","population":227,"gay_lesbian":1,"bisexual":0,"poor_health":23,"fair_health":55,"longstanding_condition":91,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"70-74","broad_age":"65+","population":260,"gay_lesbian":1,"bisexual":0,"poor_health":26,"fair_health":63,"longstanding_condition":104,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"75-79","broad_age":"65+","population":160,"gay_lesbian":1,"bisexual":0,"poor_health":16,"fair_health":39,"longstanding_condition":64,"gender_diff_birth":0},{"parish":"St Ouen","age_band":"80+","broad_age":"65+","population":200,"gay_lesbian":1,"bisexual":0,"poor_health":20,"fair_health":49,"longstanding_condition":80,"gender_diff_birth":0},{"parish":"St Peter","age_band":"15-19","broad_age":"16-24","population":240,"gay_lesbian":4,"bisexual":6,"poor_health":3,"fair_health":12,"longstanding_condition":34,"gender_diff_birth":1},{"parish":"St Peter","age_band":"20-24","broad_age":"16-24","population":258,"gay_lesbian":4,"bisexual":7,"poor_health":3,"fair_health":12,"longstanding_condition":36,"gender_diff_birth":1},{"parish":"St Peter","age_band":"25-29","broad_age":"25-34","population":226,"gay_lesbian":5,"bisexual":3,"poor_health":4,"fair_health":15,"longstanding_condition":34,"gender_diff_birth":1},{"parish":"St Peter","age_band":"30-34","broad_age":"25-34","population":288,"gay_lesbian":6,"bisexual":4,"poor_health":5,"fair_health":19,"longstanding_condition":43,"gender_diff_birth":1},{"parish":"St Peter","age_band":"35-39","broad_age":"35-44","population":295,"gay_lesbian":5,"bisexual":2,"poor_health":7,"fair_health":25,"longstanding_condition":47,"gender_diff_birth":0},{"parish":"St Peter","age_band":"40-44","broad_age":"35-44","population":348,"gay_lesbian":6,"bisexual":2,"poor_health":8,"fair_health":29,"longstanding_condition":56,"gender_diff_birth":1},{"parish":"St Peter","age_band":"45-49","broad_age":"45-54","population":355,"gay_lesbian":5,"bisexual":1,"poor_health":14,"fair_health":40,"longstanding_condition":71,"gender_diff_birth":1},{"parish":"St Peter","age_band":"50-54","broad_age":"45-54","population":387,"gay_lesbian":5,"bisexual":1,"poor_health":16,"fair_health":44,"longstanding_condition":77,"gender_diff_birth":1},{"parish":"St Peter","age_band":"55-59","broad_age":"55-64","population":428,"gay_lesbian":4,"bisexual":1,"poor_health":29,"fair_health":65,"longstanding_condition":116,"gender_diff_birth":1},{"parish":"St Peter","age_band":"60-64","broad_age":"55-64","population":359,"gay_lesbian":4,"bisexual":1,"poor_health":25,"fair_health":55,"longstanding_condition":97,"gender_diff_birth":1},{"parish":"St Peter","age_band":"65-69","broad_age":"65+","population":307,"gay_lesbian":1,"bisexual":0,"poor_health":30,"fair_health":74,"longstanding_condition":123,"gender_diff_birth":0},{"parish":"St Peter","age_band":"70-74","broad_age":"65+","population":324,"gay_lesbian":1,"bisexual":0,"poor_health":32,"fair_health":79,"longstanding_condition":130,"gender_diff_birth":0},{"parish":"St Peter","age_band":"75-79","broad_age":"65+","population":256,"gay_lesbian":1,"bisexual":0,"poor_health":25,"fair_health":62,"longstanding_condition":102,"gender_diff_birth":0},{"parish":"St Peter","age_band":"80+","broad_age":"65+","population":463,"gay_lesbian":2,"bisexual":0,"poor_health":46,"fair_health":112,"longstanding_condition":185,"gender_diff_birth":0},{"parish":"St Saviour","age_band":"15-19","broad_age":"16-24","population":819,"gay_lesbian":13,"bisexual":22,"poor_health":10,"fair_health":40,"longstanding_condition":115,"gender_diff_birth":4},{"parish":"St Saviour","age_band":"20-24","broad_age":"16-24","population":774,"gay_lesbian":12,"bisexual":21,"poor_health":9,"fair_health":37,"longstanding_condition":108,"gender_diff_birth":4},{"parish":"St Saviour","age_band":"25-29","broad_age":"25-34","population":689,"gay_lesbian":14,"bisexual":10,"poor_health":11,"fair_health":45,"longstanding_condition":103,"gender_diff_birth":3},{"parish":"St Saviour","age_band":"30-34","broad_age":"25-34","population":829,"gay_lesbian":17,"bisexual":11,"poor_health":14,"fair_health":54,"longstanding_condition":124,"gender_diff_birth":3},{"parish":"St Saviour","age_band":"35-39","broad_age":"35-44","population":995,"gay_lesbian":18,"bisexual":6,"poor_health":23,"fair_health":83,"longstanding_condition":159,"gender_diff_birth":2},{"parish":"St Saviour","age_band":"40-44","broad_age":"35-44","population":1097,"gay_lesbian":20,"bisexual":7,"poor_health":25,"fair_health":91,"longstanding_condition":176,"gender_diff_birth":2},{"parish":"St Saviour","age_band":"45-49","broad_age":"45-54","population":1057,"gay_lesbian":14,"bisexual":3,"poor_health":43,"fair_health":119,"longstanding_condition":211,"gender_diff_birth":2},{"parish":"St Saviour","age_band":"50-54","broad_age":"45-54","population":1117,"gay_lesbian":15,"bisexual":4,"poor_health":45,"fair_health":126,"longstanding_condition":223,"gender_diff_birth":3},{"parish":"St Saviour","age_band":"55-59","broad_age":"55-64","population":1030,"gay_lesbian":11,"bisexual":3,"poor_health":71,"fair_health":158,"longstanding_condition":278,"gender_diff_birth":2},{"parish":"St Saviour","age_band":"60-64","broad_age":"55-64","population":830,"gay_lesbian":9,"bisexual":2,"poor_health":57,"fair_health":127,"longstanding_condition":224,"gender_diff_birth":1},{"parish":"St Saviour","age_band":"65-69","broad_age":"65+","population":706,"gay_lesbian":3,"bisexual":1,"poor_health":70,"fair_health":171,"longstanding_condition":282,"gender_diff_birth":0},{"parish":"St Saviour","age_band":"70-74","broad_age":"65+","population":610,"gay_lesbian":2,"bisexual":1,"poor_health":61,"fair_health":148,"longstanding_condition":244,"gender_diff_birth":0},{"parish":"St Saviour","age_band":"75-79","broad_age":"65+","population":377,"gay_lesbian":1,"bisexual":0,"poor_health":37,"fair_health":91,"longstanding_condition":151,"gender_diff_birth":0},{"parish":"St Saviour","age_band":"80+","broad_age":"65+","population":616,"gay_lesbian":2,"bisexual":1,"poor_health":61,"fair_health":149,"longstanding_condition":246,"gender_diff_birth":0},{"parish":"Trinity","age_band":"15-19","broad_age":"16-24","population":172,"gay_lesbian":3,"bisexual":5,"poor_health":2,"fair_health":8,"longstanding_condition":24,"gender_diff_birth":1},{"parish":"Trinity","age_band":"20-24","broad_age":"16-24","population":180,"gay_lesbian":3,"bisexual":5,"poor_health":2,"fair_health":9,"longstanding_condition":25,"gender_diff_birth":1},{"parish":"Trinity","age_band":"25-29","broad_age":"25-34","population":140,"gay_lesbian":3,"bisexual":2,"poor_health":2,"fair_health":9,"longstanding_condition":21,"gender_diff_birth":1},{"parish":"Trinity","age_band":"30-34","broad_age":"25-34","population":153,"gay_lesbian":3,"bisexual":2,"poor_health":3,"fair_health":10,"longstanding_condition":23,"gender_diff_birth":1},{"parish":"Trinity","age_band":"35-39","broad_age":"35-44","population":240,"gay_lesbian":4,"bisexual":1,"poor_health":6,"fair_health":20,"longstanding_condition":38,"gender_diff_birth":0},{"parish":"Trinity","age_band":"40-44","broad_age":"35-44","population":241,"gay_lesbian":4,"bisexual":1,"poor_health":6,"fair_health":20,"longstanding_condition":39,"gender_diff_birth":0},{"parish":"Trinity","age_band":"45-49","broad_age":"45-54","population":284,"gay_lesbian":4,"bisexual":1,"poor_health":11,"fair_health":32,"longstanding_condition":57,"gender_diff_birth":1},{"parish":"Trinity","age_band":"50-54","broad_age":"45-54","population":281,"gay_lesbian":4,"bisexual":1,"poor_health":11,"fair_health":32,"longstanding_condition":56,"gender_diff_birth":1},{"parish":"Trinity","age_band":"55-59","broad_age":"55-64","population":265,"gay_lesbian":3,"bisexual":1,"poor_health":18,"fair_health":41,"longstanding_condition":72,"gender_diff_birth":0},{"parish":"Trinity","age_band":"60-64","broad_age":"55-64","population":215,"gay_lesbian":2,"bisexual":1,"poor_health":15,"fair_health":33,"longstanding_condition":58,"gender_diff_birth":0},{"parish":"Trinity","age_band":"65-69","broad_age":"65+","population":165,"gay_lesbian":1,"bisexual":0,"poor_health":16,"fair_health":40,"longstanding_condition":66,"gender_diff_birth":0},{"parish":"Trinity","age_band":"70-74","broad_age":"65+","population":165,"gay_lesbian":1,"bisexual":0,"poor_health":16,"fair_health":40,"longstanding_condition":66,"gender_diff_birth":0},{"parish":"Trinity","age_band":"75-79","broad_age":"65+","population":93,"gay_lesbian":0,"bisexual":0,"poor_health":9,"fair_health":23,"longstanding_condition":37,"gender_diff_birth":0},{"parish":"Trinity","age_band":"80+","broad_age":"65+","population":184,"gay_lesbian":1,"bisexual":0,"poor_health":18,"fair_health":45,"longstanding_condition":74,"gender_diff_birth":0}];

const VARIABLE_CONFIG = {
  gay_lesbian:            {label:"Gay or Lesbian",               color:"#a855f7", special:true,  desc:"Sexual orientation — gay or lesbian (Article 9 GDPR special category)"},
  bisexual:               {label:"Bisexual",                     color:"#ec4899", special:true,  desc:"Sexual orientation — bisexual (Article 9 GDPR special category)"},
  gender_diff_birth:      {label:"Gender different from birth",  color:"#f59e0b", special:true,  desc:"Gender identity different from sex registered at birth (Article 9 GDPR special category)"},
  longstanding_condition: {label:"Longstanding health condition",color:"#ef4444", special:true,  desc:"Longstanding physical or mental health condition or illness (Article 9 GDPR special category)"},
  poor_health:            {label:"Poor or very poor health",     color:"#f97316", special:true,  desc:"Self-assessed general health rated poor or very poor"},
  fair_health:            {label:"Fair health",                  color:"#eab308", special:false, desc:"Self-assessed general health rated fair"},
};

const PARISHES_JSY = ["Grouville","St Brelade","St Clement","St Helier","St John","St Lawrence","St Martin","St Mary","St Ouen","St Peter","St Saviour","Trinity"];
const AGE_BANDS_JSY = ["15-19","20-24","25-29","30-34","35-39","40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80+"];

function DataJoinTool() {
  const [parish, setParish] = useState("St Mary");
  const [variable, setVariable] = useState("gay_lesbian");
  const [showAll, setShowAll] = useState(false);

  const parishData = useMemo(() =>
    JERSEY_JOIN_DATA.filter(r => r.parish === parish)
      .sort((a,b) => AGE_BANDS_JSY.indexOf(a.age_band) - AGE_BANDS_JSY.indexOf(b.age_band)),
    [parish]
  );

  const vc = VARIABLE_CONFIG[variable];
  const totalAffected = parishData.reduce((s,r) => s+r[variable], 0);
  const totalPop = parishData.reduce((s,r) => s+r.population, 0);
  const exposedCells = parishData.filter(r => r[variable] <= 3 && r[variable] > 0);
  const uniqueCells = parishData.filter(r => r[variable] === 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:15, marginBottom:4 }}>
          Jersey Open Data Join — Special Category Disclosure
        </div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:4, lineHeight:1.6 }}>
          Joins publicly available Jersey Census 2021 tables from{" "}
          <span style={{color:"#60a5fa"}}>opendata.gov.je</span> to demonstrate that special category
          data (Article 9 GDPR) is effectively disclosed at parish × age level.
          No data breach. No specialist access. Published government open data.
        </div>
        <div style={{ background:"#0f172a", borderRadius:6, padding:10, marginBottom:16,
          border:"1px solid #334155", fontSize:11, color:"#64748b" }}>
          <strong style={{color:"#94a3b8"}}>Sources (all public):</strong>{" "}
          Parish × Age × Sex ✕ Sexual Orientation by Age ✕ Health by Age ✕ Gender Identity by Age — opendata.gov.je/dataset/2021-census
        </div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
          <div>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Parish</div>
            <select value={parish} onChange={e=>setParish(e.target.value)}
              style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 12px", color:"#f1f5f9", fontSize:13 }}>
              {PARISHES_JSY.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Special Category Variable</div>
            <select value={variable} onChange={e=>setVariable(e.target.value)}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"8px 12px", color:"#f1f5f9", fontSize:13 }}>
              {Object.entries(VARIABLE_CONFIG).map(([k,v])=>(
                <option key={k} value={k}>{v.label}{v.special?" ⚠":""}</option>
              ))}
            </select>
          </div>
        </div>

        {vc.special && (
          <div style={{ background:"#1a0533", border:"1px solid #7c3aed", borderRadius:6,
            padding:"8px 12px", marginBottom:16, fontSize:12, color:"#c4b5fd" }}>
            ⚠ <strong>Special category data (Article 9 GDPR):</strong> {vc.desc}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:20 }}>
          {[
            {k:"Parish population",        v: totalPop.toLocaleString(),     c:"#94a3b8"},
            {k:`Est. ${vc.label.toLowerCase().substring(0,20)}`, v: totalAffected.toLocaleString(), c: vc.color},
            {k:"Cells with ≤3 people",     v: exposedCells.length,           c: exposedCells.length>0?"#ef4444":"#22c55e"},
            {k:"Cells with 1 person",      v: uniqueCells.length,            c: uniqueCells.length>0?"#ef4444":"#22c55e"},
          ].map(r=>(
            <div key={r.k} style={{ background:"#0f172a", borderRadius:8, padding:12 }}>
              <div style={{ color:"#475569", fontSize:9, textTransform:"uppercase", marginBottom:4 }}>{r.k}</div>
              <div style={{ color:r.c, fontWeight:700, fontSize:22 }}>{r.v}</div>
            </div>
          ))}
        </div>

        <div style={{ color:"#e2e8f0", fontWeight:600, fontSize:13, marginBottom:10 }}>
          {parish} — {vc.label} by age band
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {parishData.filter(r => showAll || r[variable] > 0).map(r => {
            const val = r[variable];
            const isExposed = val <= 3 && val > 0;
            const isUnique = val === 1;
            const maxVal = Math.max(...parishData.map(x=>x[variable]), 1);
            return (
              <div key={r.age_band} style={{
                background: isUnique?"#450a0a": isExposed?"#431407":"#1e293b",
                borderRadius:6, padding:"10px 14px",
                border:`1px solid ${isUnique?"#ef4444":isExposed?"#f97316":"#334155"}`,
                display:"flex", alignItems:"center", gap:10
              }}>
                <div style={{ width:54, color:"#94a3b8", fontSize:12, flexShrink:0 }}>{r.age_band}</div>
                <div style={{ flex:1 }}>
                  <div style={{ background:"#0f172a", borderRadius:3, height:5 }}>
                    <div style={{ width:`${Math.min((val/maxVal)*100,100)}%`, height:"100%", background:vc.color, borderRadius:3 }}/>
                  </div>
                </div>
                <div style={{ color:"#475569", fontSize:11, width:100, textAlign:"right" }}>pop {r.population.toLocaleString()}</div>
                <div style={{ width:70, textAlign:"right", flexShrink:0 }}>
                  <span style={{ color:isUnique?"#ef4444":isExposed?"#f97316":vc.color, fontWeight:700, fontSize:18 }}>{val}</span>
                  <span style={{ color:"#475569", fontSize:10 }}> est.</span>
                </div>
                {isUnique && <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:3, flexShrink:0 }}>UNIQUE</span>}
                {isExposed && !isUnique && <span style={{ background:"#f97316", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:3, flexShrink:0 }}>EXPOSED</span>}
              </div>
            );
          })}
        </div>
        <button onClick={()=>setShowAll(!showAll)}
          style={{ marginTop:10, background:"none", border:"1px solid #334155", borderRadius:4, color:"#64748b", padding:"4px 12px", fontSize:11, cursor:"pointer" }}>
          {showAll?"Show only non-zero cells":"Show all age bands"}
        </button>
      </div>

      {uniqueCells.length > 0 && (
        <div style={{ background:"#450a0a", borderRadius:10, padding:20, border:"2px solid #ef4444" }}>
          <div style={{ color:"#ef4444", fontWeight:800, fontSize:16, marginBottom:8 }}>
            ⚠ Effective individual-level disclosure — {parish}
          </div>
          <div style={{ color:"#fca5a5", fontSize:13, lineHeight:1.7, marginBottom:12 }}>
            The following age bands in {parish} contain an estimated <strong>single individual</strong>{" "}
            with <strong>{vc.label.toLowerCase()}</strong>, derived by joining publicly available
            Jersey Census 2021 tables. No data breach occurred.
            This is a joinability demonstration using published open data.
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
            {uniqueCells.map(r=>(
              <div key={r.age_band} style={{ background:"#0f172a", borderRadius:6, padding:"8px 14px", border:"1px solid #ef4444" }}>
                <div style={{ color:"#fca5a5", fontWeight:700 }}>{r.age_band}</div>
                <div style={{ color:"#64748b", fontSize:11 }}>pop {r.population} · est. 1 person</div>
              </div>
            ))}
          </div>
          <div style={{ color:"#94a3b8", fontSize:11, lineHeight:1.6 }}>
            <strong style={{color:"#e2e8f0"}}>Source:</strong> opendata.gov.je/dataset/2021-census —
            Open Government Licence Jersey v1.0. All data publicly accessible without registration.
          </div>
        </div>
      )}
    </div>
  );
}

function RestrictedArea() {
  const { user, signOut } = useAuth();
  const [tool, setTool] = useState("persona");

  return (
    <div>
      <div style={{ background:"#1e293b", borderRadius:8, padding:"10px 16px", marginBottom:20,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderLeft:"3px solid #7c3aed" }}>
        <div style={{ color:"#a78bfa", fontSize:12 }}>
          🔒 Restricted access — logged in as <strong>{user.email}</strong>
        </div>
        <button onClick={signOut} style={{ background:"none", border:"1px solid #334155",
          color:"#64748b", borderRadius:4, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>
          Sign out
        </button>
      </div>

      <div style={{ background:"#0f172a", borderRadius:8, padding:14, borderLeft:"3px solid #ef4444", marginBottom:20 }}>
        <div style={{ color:"#fca5a5", fontSize:12, fontWeight:600, marginBottom:4 }}>⚠ Restricted Research Tools</div>
        <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>
          These tools demonstrate re-identification vulnerabilities using publicly available census data.
          Access is restricted to invited regulators and researchers. Do not share these URLs or outputs
          without explicit permission from Coalfinch Data Governance Advisory.
        </div>
      </div>

      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid #1e293b" }}>
        {[["persona","Persona Tool"],["attack","Attack Simulator"],["datajoin","🔴 Jersey Data Join"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTool(v)} style={{ padding:"7px 14px", border:"none", background:"none", cursor:"pointer", color:tool===v?"#a78bfa":"#64748b", borderBottom:tool===v?"2px solid #a78bfa":"2px solid transparent", fontSize:12, fontWeight:tool===v?600:400, marginBottom:-1, whiteSpace:"nowrap" }}>{l}</button>
        ))}
      </div>

      {tool === "persona" && <PersonaTool/>}
      {tool === "attack" && <AttackSimulator/>}
      {tool === "datajoin" && <DataJoinTool/>}
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    const r = await signIn(email, password);
    if (!r.ok) setError(r.error || "Invalid credentials");
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:360, background:"#1e293b", borderRadius:12, padding:28 }}>
        <div style={{ color:"#a78bfa", fontWeight:700, fontSize:14, marginBottom:4 }}>🔒 Restricted Access</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:20, lineHeight:1.6 }}>
          Demonstration tools are available to invited regulators and researchers only.
          To request access contact{" "}
          <span style={{ color:"#60a5fa" }}>james.cochrane@coalfinch.com</span>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="you@organisation.gov"
            style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"9px 12px", color:"#f1f5f9", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="••••••••"
            style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:6, padding:"9px 12px", color:"#f1f5f9", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {error && <div style={{ background:"#450a0a", border:"1px solid #ef4444", borderRadius:6, padding:"8px 12px", color:"#fca5a5", fontSize:12, marginBottom:12 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", background:loading?"#1e3a5f":"#4c1d95", color:"#fff", border:"none", borderRadius:6, padding:"10px", fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
function AppContent() {
  const { user, authLoading } = useAuth();
  const [tab, setTab] = useState("overview");

  const publicTabs = [
    {id:"overview", label:"Overview"},
    {id:"areas",    label:"Area Explorer"},
    {id:"kanon",    label:"k-Anonymity"},
    {id:"restricted", label:"🔒 Restricted Tools"},
  ];

  const content = {
    overview: <OverviewTab/>,
    areas:    <AreaTab/>,
    kanon:    <KTab/>,
    restricted: authLoading ? (
      <div style={{ color:"#64748b", padding:20 }}>Loading…</div>
    ) : user ? (
      <RestrictedArea/>
    ) : (
      <LoginScreen/>
    ),
  };

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#0f172a",
      minHeight:"100vh", color:"#e2e8f0", padding:"20px 24px" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ display:"flex", gap:2 }}>
            {["#3b82f6","#10b981","#f59e0b"].map((c,i)=>(
              <div key={i} style={{ width:4, height:28, background:c, borderRadius:2 }}/>
            ))}
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:19, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.01em" }}>
              Crown Dependencies Re-Identification Observatory
            </h1>
            <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>
              Isle of Man · Guernsey · Jersey — 2021 census · {(84069+63448+109417).toLocaleString()} synthetic records · 47 areas
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid #1e293b" }}>
        {publicTabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"7px 14px", border:"none", background:"none", cursor:"pointer",
              color: t.id==="restricted" ? (tab===t.id?"#a78bfa":"#7c3aed") : (tab===t.id?"#60a5fa":"#64748b"),
              borderBottom: t.id==="restricted" ? (tab===t.id?"2px solid #a78bfa":"2px solid transparent") : (tab===t.id?"2px solid #60a5fa":"2px solid transparent"),
              fontSize:12, fontWeight:tab===t.id?600:400, marginBottom:-1, whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:960 }}>
        {content[tab]}
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
