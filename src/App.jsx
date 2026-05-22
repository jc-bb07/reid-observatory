import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, LineChart, Line, ResponsiveContainer, ReferenceLine
} from "recharts";

// ── All data embedded from synthetic population analysis ──────────────────────
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

// ── Overview ──────────────────────────────────────────────────────────────────
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
              <div style={{ color:isl.color, fontWeight:700, fontSize:14, marginBottom:12 }}>
                {isl.name}
              </div>
              {[
                {k:"Population",       v: isl.population.toLocaleString()},
                {k:"Areas/parishes",   v: isl.areas.length},
                {k:"Max unique (4 QI)",v: maxArea.u_age_sex_occ.toFixed(1)+"%",  sub:maxArea.name},
                {k:"Max unique (5 QI)",v: maxArea5.u_all4.toFixed(1)+"%",         sub:maxArea5.name},
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
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4 }}>
          Island-Level Uniqueness by Quasi-Identifier Set
        </div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>
          % of each island's population statistically unique on the given combination (all areas combined)
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={DATA.island_comparison} margin={{top:4,right:16,bottom:64,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="label" tick={{fill:"#94a3b8",fontSize:10}}
              angle={-30} textAnchor="end" interval={0}/>
            <YAxis tick={{fill:"#94a3b8",fontSize:11}} tickFormatter={v=>v+"%"}/>
            <Tooltip content={<Tip/>}/>
            <Legend wrapperStyle={{color:"#94a3b8",fontSize:12,paddingTop:8}}/>
            <Bar dataKey="iom"      name="Isle of Man" fill={DATA.islands.iom.color}      radius={[3,3,0,0]}/>
            <Bar dataKey="guernsey" name="Guernsey"    fill={DATA.islands.guernsey.color} radius={[3,3,0,0]}/>
            <Bar dataKey="jersey"   name="Jersey"      fill={DATA.islands.jersey.color}   radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:16 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:12 }}>
          Notable Outliers — Highest Re-identification Risk Areas
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            {name:"Herm/Jethou", island:"Guernsey", pop:85,   u4:50.6, u5:85.9,
             note:"Pop 85. Over half unique on 4 QIs. Near-total exposure at 5.", key:"guernsey"},
            {name:"Bride",       island:"Isle of Man", pop:359, u4:18.7, u5:49.0,
             note:"Smallest IoM sheading. 1 in 5 unique at 4 QIs.", key:"iom"},
            {name:"St Mary",     island:"Jersey",   pop:2478, u4:1.4,  u5:13.6,
             note:"Smallest Jersey parish. Risk grows steeply with each variable.", key:"jersey"},
          ].map(d => (
            <div key={d.name} style={{ background:"#0f172a", borderRadius:8, padding:14,
              borderLeft:`3px solid ${DATA.islands[d.key].color}` }}>
              <div style={{ color:"#f1f5f9", fontWeight:700 }}>{d.name}</div>
              <div style={{ color:"#64748b", fontSize:11, marginBottom:8 }}>
                {d.island} · pop {d.pop.toLocaleString()}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                {[["4 QIs",d.u4],["5 QIs",d.u5]].map(([label,val])=>(
                  <div key={label} style={{ flex:1, background:"#1e293b", borderRadius:4, padding:"6px 8px" }}>
                    <div style={{ color:"#64748b", fontSize:9, textTransform:"uppercase" }}>{label}</div>
                    <div style={{ color:riskColor(val), fontWeight:700, fontSize:20 }}>{val}%</div>
                  </div>
                ))}
              </div>
              <div style={{ color:"#64748b", fontSize:11 }}>{d.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#0f172a", borderRadius:8, padding:14, borderLeft:"3px solid #334155" }}>
        <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
          <strong style={{ color:"#e2e8f0" }}>Key finding:</strong> At 3 quasi-identifiers (area + age + sex),
          all three Crown Dependencies show <strong style={{ color:"#f1f5f9" }}>0% statistical uniqueness</strong> —
          parish-level density still provides adequate k-anonymity protection. The critical threshold is
          the addition of a 4th variable (occupation or household size), at which point small-population
          areas become acutely vulnerable. The IoM's 24-area granularity makes it
          structurally more exposed than Jersey (12 areas) despite Jersey's larger population.
        </div>
      </div>
    </div>
  );
}

// ── Area Explorer ─────────────────────────────────────────────────────────────
function AreaTab() {
  const [islands, setIslands] = useState(["iom","guernsey","jersey"]);
  const [qi, setQi] = useState("4qi");
  const [sortBy, setSortBy] = useState("uniqueness");

  const field = QI_FIELD[qi];
  const toggleIsland = k => setIslands(prev =>
    prev.includes(k) ? prev.filter(x=>x!==k) : [...prev, k]
  );

  const allAreas = useMemo(() => {
    let combined = [];
    islands.forEach(key => {
      DATA.islands[key].areas.forEach(a => combined.push({...a, islandKey:key}));
    });
    return combined.sort((a,b) =>
      sortBy==="uniqueness" ? b[field]-a[field] : b.population-a.population
    );
  }, [islands, qi, sortBy, field]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-start" }}>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Islands</div>
          <div style={{ display:"flex", gap:4 }}>
            {ISLAND_KEYS.map(k => {
              const active = islands.includes(k);
              return (
                <button key={k} onClick={()=>toggleIsland(k)}
                  style={{ padding:"4px 12px", borderRadius:4, border:`1px solid`,
                    borderColor: active ? DATA.islands[k].color : "#334155",
                    background: active ? DATA.islands[k].color+"22" : "#1e293b",
                    color: active ? DATA.islands[k].color : "#64748b",
                    fontSize:11, cursor:"pointer", fontWeight: active?600:400 }}>
                  {DATA.islands[k].name}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>QI Set</div>
          <div style={{ display:"flex", gap:4 }}>
            {[["4qi","+ Occupation"],["5qi","All 5 QIs"]].map(([v,l])=>(
              <button key={v} onClick={()=>setQi(v)}
                style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                  borderColor:qi===v?"#60a5fa":"#334155",
                  background:qi===v?"#1d4ed8":"#1e293b",
                  color:qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>Sort</div>
          <div style={{ display:"flex", gap:4 }}>
            {[["uniqueness","Uniqueness"],["population","Population"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortBy(v)}
                style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                  borderColor:sortBy===v?"#60a5fa":"#334155",
                  background:sortBy===v?"#1d4ed8":"#1e293b",
                  color:sortBy===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ color:"#64748b", fontSize:12 }}>
        {allAreas.length} areas · <span style={{ color:"#e2e8f0" }}>{QI_LABEL[qi]}</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {allAreas.map(a => {
          const pct = a[field];
          const color = DATA.islands[a.islandKey].color;
          return (
            <div key={`${a.islandKey}-${a.id}`}
              style={{ background:"#1e293b", borderRadius:8, padding:"10px 14px",
                display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:3, height:32, background:color, borderRadius:2, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{a.name}</span>
                  <span style={{ color:"#475569", fontSize:11 }}>{DATA.islands[a.islandKey].name}</span>
                  <RiskBadge pct={pct}/>
                </div>
                <div style={{ background:"#0f172a", borderRadius:3, height:5 }}>
                  <div style={{ width:`${Math.min(pct/Math.max(...allAreas.map(x=>x[field]),1)*100,100)}%`,
                    height:"100%", background:riskColor(pct), borderRadius:3, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ color:riskColor(pct), fontWeight:700, fontSize:20 }}>
                  {pct.toFixed(1)}%
                </div>
                <div style={{ color:"#475569", fontSize:11 }}>
                  {a.population.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Population Size Effect ────────────────────────────────────────────────────
function SizeTab() {
  const [qi, setQi] = useState("4qi");
  const field = qi==="5qi" ? "u_all4" : "u_age_sex_occ";

  const scatterData = useMemo(() => {
    const out = {};
    ISLAND_KEYS.forEach(key => {
      out[key] = DATA.islands[key].areas.map(a => ({
        x: a.population, y: a[field], name: a.name
      }));
    });
    return out;
  }, [qi, field]);

  const ScatterTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:6, padding:"8px 12px", fontSize:12 }}>
        <div style={{ color:"#f1f5f9", fontWeight:600 }}>{d.name}</div>
        <div style={{ color:"#94a3b8" }}>Pop: {d.x?.toLocaleString()}</div>
        <div style={{ color:riskColor(d.y) }}>Unique: {d.y?.toFixed(2)}%</div>
      </div>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>QI Set</div>
        <div style={{ display:"flex", gap:4 }}>
          {[["4qi","Age + Sex + Occupation"],["5qi","All 5 QIs"]].map(([v,l])=>(
            <button key={v} onClick={()=>setQi(v)}
              style={{ padding:"4px 12px", borderRadius:4, border:"1px solid",
                borderColor:qi===v?"#60a5fa":"#334155",
                background:qi===v?"#1d4ed8":"#1e293b",
                color:qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4 }}>
          Uniqueness vs Population — All 47 Areas, Three Islands
        </div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>
          X-axis log scale. Each point = one geographic area. The inverse relationship is sharp and consistent across islands.
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{top:8,right:24,bottom:36,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="x" type="number" scale="log" domain={["auto","auto"]}
              tick={{fill:"#94a3b8",fontSize:10}} name="Population"
              tickFormatter={v=>v>=1000?(v/1000).toFixed(0)+"k":v}
              label={{value:"Population (log scale)",position:"insideBottom",offset:-16,fill:"#64748b",fontSize:11}}/>
            <YAxis dataKey="y" type="number"
              tick={{fill:"#94a3b8",fontSize:11}} tickFormatter={v=>v+"%"}
              label={{value:"Uniqueness %",angle:-90,position:"insideLeft",fill:"#64748b",fontSize:11}}/>
            <Tooltip content={<ScatterTip/>}/>
            <Legend wrapperStyle={{color:"#94a3b8",fontSize:12}}/>
            <ReferenceLine y={5}  stroke="#f97316" strokeDasharray="4 4"
              label={{value:"5%",fill:"#f97316",fontSize:10,position:"right"}}/>
            <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 4"
              label={{value:"20%",fill:"#ef4444",fontSize:10,position:"right"}}/>
            {ISLAND_KEYS.map(key=>(
              <Scatter key={key} name={DATA.islands[key].name}
                data={scatterData[key]} fill={DATA.islands[key].color} opacity={0.85}/>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:16 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:12 }}>Population vs Risk — Summary Table</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #334155" }}>
                {["Area","Island","Population","4 QI unique","5 QI unique"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"4px 10px", color:"#64748b", fontSize:10, textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ISLAND_KEYS.flatMap(key =>
                DATA.islands[key].areas.map(a=>({...a, islandKey:key}))
              ).sort((a,b)=>b.u_age_sex_occ-a.u_age_sex_occ).slice(0,15).map((a,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #1e293b" }}>
                  <td style={{ padding:"5px 10px", color:"#e2e8f0", fontWeight:600 }}>{a.name}</td>
                  <td style={{ padding:"5px 10px" }}>
                    <span style={{ color:DATA.islands[a.islandKey].color, fontSize:11 }}>
                      {DATA.islands[a.islandKey].name}
                    </span>
                  </td>
                  <td style={{ padding:"5px 10px", color:"#94a3b8" }}>{a.population.toLocaleString()}</td>
                  <td style={{ padding:"5px 10px" }}>
                    <span style={{ color:riskColor(a.u_age_sex_occ), fontWeight:700 }}>
                      {a.u_age_sex_occ.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding:"5px 10px" }}>
                    <span style={{ color:riskColor(a.u_all4), fontWeight:700 }}>
                      {a.u_all4.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── k-Anonymity Profile ───────────────────────────────────────────────────────
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
            <button key={v} onClick={()=>setQi(v)}
              style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                borderColor:qi===v?"#60a5fa":"#334155",
                background:qi===v?"#1d4ed8":"#1e293b",
                color:qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4 }}>
          % of Population in Groups of Size ≥ k
        </div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>
          k=1 intercept = uniqueness %. Steeper descent = greater exposure. Jersey's larger population gives it structural k-anonymity advantage.
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{top:8,right:24,bottom:24,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="k" tick={{fill:"#94a3b8",fontSize:11}}
              label={{value:"k (minimum group size)",position:"insideBottom",offset:-8,fill:"#64748b",fontSize:11}}/>
            <YAxis tick={{fill:"#94a3b8",fontSize:11}} tickFormatter={v=>v+"%"} domain={[0,100]}/>
            <Tooltip content={<Tip/>} formatter={(v)=>v.toFixed(2)+"%"}/>
            <Legend wrapperStyle={{color:"#94a3b8",fontSize:12}}/>
            {ISLAND_KEYS.map(key=>(
              <Line key={key} type="monotone" dataKey={DATA.islands[key].name}
                stroke={DATA.islands[key].color} strokeWidth={2} dot={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {ISLAND_KEYS.map(key => {
          const isl = DATA.islands[key];
          const profile = isl.k_profiles[qi];
          const rows = [
            {label:"Unique (k=1)",    pct: parseFloat((100-profile[0]).toFixed(2))},
            {label:"k ≤ 2",          pct: parseFloat((100-profile[1]).toFixed(2))},
            {label:"k ≤ 5",          pct: parseFloat((100-profile[4]).toFixed(2))},
            {label:"k ≤ 10",         pct: parseFloat((100-profile[9]).toFixed(2))},
          ];
          return (
            <div key={key} style={{ background:"#1e293b", borderRadius:10, padding:14,
              borderTop:`3px solid ${isl.color}` }}>
              <div style={{ color:isl.color, fontWeight:700, marginBottom:12 }}>{isl.name}</div>
              {rows.map(r=>(
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:8 }}>
                  <div style={{ color:"#94a3b8", fontSize:12 }}>{r.label}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color:riskColor(r.pct), fontWeight:700, fontSize:16 }}>
                      {r.pct.toFixed(2)}%
                    </span>
                    <RiskBadge pct={r.pct}/>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function AboutTab() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, color:"#94a3b8", fontSize:13, lineHeight:1.7 }}>
      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:15, marginBottom:10 }}>
          Crown Dependencies Re-Identification Risk Observatory
        </div>
        <p style={{ margin:"0 0 10px" }}>
          Comparative re-identification risk analysis across the three Crown Dependencies using 2021
          census synthetic populations. Populations of 84,069 (IoM), 63,448 (Guernsey), and 109,417
          (Jersey) were generated from published census marginals and subjected to empirical uniqueness
          analysis across combinations of quasi-identifiers.
        </p>
        <p style={{ margin:0 }}>
          The core finding is that <strong style={{color:"#f1f5f9"}}>population size at sub-island
          level is the dominant risk amplifier</strong>, not island-level population. Areas under ~2,000
          residents are acutely vulnerable to re-identification once 4+ quasi-identifiers are combined.
        </p>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:10 }}>Quasi-Identifier Schema</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #334155" }}>
              {["Variable","Values","Coverage"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"4px 8px", color:"#64748b", fontSize:10, textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Area","Parish/sheading (IoM:24, Gsy:11, Jsy:12)","Exact from census tables"],
              ["Age band","18 quinary bands 0–4 … 85+ (Jersey: 17 bands to 80+)","Exact from census tables"],
              ["Sex","Male / Female","Exact from census tables"],
              ["Occupation","SOC Level 1 (9 categories + not employed)","IoM: Table 1.9/1.10; Gsy: modelled from sector data; Jsy: modelled"],
              ["Household size","1–6+ persons","Derived from household composition tables"],
            ].map(([v,vals,cov])=>(
              <tr key={v} style={{ borderBottom:"1px solid #1e293b" }}>
                <td style={{ padding:"6px 8px", color:"#e2e8f0", fontWeight:600 }}>{v}</td>
                <td style={{ padding:"6px 8px" }}>{vals}</td>
                <td style={{ padding:"6px 8px", fontSize:11, color:"#64748b" }}>{cov}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background:"#1e293b", borderRadius:10, padding:20 }}>
        <div style={{ color:"#e2e8f0", fontWeight:600, marginBottom:10 }}>Structural Findings</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["3 QIs (area + age + sex)","0% unique across all three islands","Population density at parish level provides adequate protection."],
            ["4 QIs (+ occupation)","IoM 1.17%, Guernsey 0.44%, Jersey 0.24%","Small-area effect kicks in. IoM's 24-area granularity is most exposed."],
            ["5 QIs (all)","IoM 9.18%, Guernsey 4.51%, Jersey 3.38%","Substantial fractions identifiable. Herm/Jethou 85.9% — effectively unprotected."],
            ["Inflection point","~2,000 population","Areas below this threshold are disproportionately affected at 4+ QIs."],
            ["Occupation leverage","Highest single-variable risk amplifier","Adding occupation to area+age+sex is the critical step across all islands."],
          ].map(([title, result, note])=>(
            <div key={title} style={{ background:"#0f172a", borderRadius:8, padding:12,
              display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:12, alignItems:"start" }}>
              <div style={{ color:"#e2e8f0", fontWeight:600, fontSize:12 }}>{title}</div>
              <div style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>{result}</div>
              <div style={{ color:"#64748b", fontSize:11 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#0f172a", borderRadius:8, padding:14, fontSize:11, color:"#64748b" }}>
        <strong style={{color:"#475569"}}>Framework:</strong> Extends Rocher, Hendrickx &amp; de Montjoye
        (Science, 2019) to small-population jurisdictions. Uniqueness = fraction of individuals who are
        the sole occupant of their quasi-identifier equivalence class. Synthetic populations preserve
        published marginal distributions without containing real personal data. Occupation for Guernsey
        and Jersey is modelled from sector employment distribution rather than directly published SOC
        counts — flagged for responsible disclosure context.
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const tabs = [
    {id:"overview", label:"Overview"},
    {id:"areas",    label:"Area Explorer"},
    {id:"size",     label:"Population Size Effect"},
    {id:"kanon",    label:"k-Anonymity Profile"},
    {id:"about",    label:"About & Methods"},
  ];
  const content = {
    overview: <OverviewTab/>,
    areas:    <AreaTab/>,
    size:     <SizeTab/>,
    kanon:    <KTab/>,
    about:    <AboutTab/>,
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
              Isle of Man · Guernsey · Jersey — 2021 census synthetic populations ·{" "}
              {(84069+63448+109417).toLocaleString()} total synthetic records · 47 geographic areas
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid #1e293b" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"7px 14px", border:"none", background:"none", cursor:"pointer",
              color:tab===t.id?"#60a5fa":"#64748b",
              borderBottom:tab===t.id?"2px solid #60a5fa":"2px solid transparent",
              fontSize:12, fontWeight:tab===t.id?600:400, transition:"all 0.15s",
              marginBottom:-1, whiteSpace:"nowrap" }}>
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
