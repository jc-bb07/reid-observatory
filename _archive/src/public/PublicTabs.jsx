import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { ISLANDS, ISLAND_KEYS, ISLAND_COMPARISON } from "../data/constants";
import { riskColor, RiskBadge, ChartTip } from "../shared/ui";

// ── Overview ──────────────────────────────────────────────────────────────────
export function OverviewTab() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {ISLAND_KEYS.map(key => {
          const isl = ISLANDS[key];
          const areas = isl.areas.map(a => ({ ...a, ...isl.areaStats[a.name] }));
          const maxArea  = [...areas].sort((a,b) => b.u_age_sex_occ - a.u_age_sex_occ)[0];
          const maxArea5 = [...areas].sort((a,b) => b.u_all4 - a.u_all4)[0];
          return (
            <div key={key} style={{ background:"#1e293b", borderRadius:10, padding:16,
              borderTop:`3px solid ${isl.color}` }}>
              <div style={{ color:isl.color, fontWeight:700, fontSize:14, marginBottom:12 }}>
                {isl.name}
              </div>
              {[
                { k:"Population",        v: isl.population.toLocaleString() },
                { k:"Areas / parishes",  v: isl.areas.length },
                { k:"Max unique (4 QI)", v: maxArea.u_age_sex_occ.toFixed(1)+"%", sub:maxArea.name },
                { k:"Max unique (5 QI)", v: maxArea5.u_all4.toFixed(1)+"%",       sub:maxArea5.name },
              ].map(r => (
                <div key={r.k} style={{ marginBottom:10 }}>
                  <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase",
                    letterSpacing:"0.05em" }}>{r.k}</div>
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
          % of each island's population statistically unique on the given combination.
          Derived from synthetic population model calibrated to 2021 census distributions.
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ISLAND_COMPARISON} margin={{ top:4, right:16, bottom:64, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="label" tick={{ fill:"#94a3b8", fontSize:10 }} angle={-30}
              textAnchor="end" interval={0}/>
            <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} tickFormatter={v => v+"%"}/>
            <Tooltip content={<ChartTip/>}/>
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12, paddingTop:8 }}/>
            {ISLAND_KEYS.map(key => (
              <Bar key={key} dataKey={key} name={ISLANDS[key].name}
                fill={ISLANDS[key].color} radius={[3,3,0,0]}/>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:"#0f172a", borderRadius:8, padding:14, borderLeft:"3px solid #334155" }}>
        <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
          <strong style={{ color:"#e2e8f0" }}>Key finding:</strong> At 3 quasi-identifiers
          (area + age + sex), all three Crown Dependencies show{" "}
          <strong style={{ color:"#f1f5f9" }}>0% statistical uniqueness</strong>.
          The critical threshold is the 4th variable. The IoM's 24-area granularity makes it
          structurally more exposed than Jersey (12 areas) despite Jersey's larger population.
        </div>
      </div>
    </div>
  );
}

// ── Area Explorer ─────────────────────────────────────────────────────────────
export function AreaTab() {
  const [selectedIslands, setSelectedIslands] = useState(["iom","guernsey","jersey"]);
  const [qi, setQi]       = useState("4qi");
  const [sortBy, setSortBy] = useState("uniqueness");

  const fieldMap = { "3qi":"u_age_sex", "4qi":"u_age_sex_occ", "5qi":"u_all4" };
  const field = fieldMap[qi];

  const allAreas = ISLAND_KEYS
    .filter(k => selectedIslands.includes(k))
    .flatMap(k => ISLANDS[k].areas.map(a => ({
      ...a,
      ...ISLANDS[k].areaStats[a.name],
      islandKey: k,
      islandName: ISLANDS[k].name,
      islandColor: ISLANDS[k].color,
    })));

  const sorted = [...allAreas].sort((a,b) =>
    sortBy === "uniqueness" ? b[field] - a[field] : a.population - b.population
  );

  const maxPct = Math.max(...allAreas.map(a => a[field]), 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Controls */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>
            Islands
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {ISLAND_KEYS.map(k => (
              <button key={k} onClick={() =>
                setSelectedIslands(prev =>
                  prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
                )}
                style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                  borderColor: selectedIslands.includes(k) ? ISLANDS[k].color : "#334155",
                  background: selectedIslands.includes(k) ? ISLANDS[k].color+"22" : "#1e293b",
                  color: selectedIslands.includes(k) ? ISLANDS[k].color : "#94a3b8",
                  fontSize:11, cursor:"pointer" }}>
                {ISLANDS[k].name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>
            QI Set
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[["3qi","Age + Sex"],["4qi","+ Occupation"],["5qi","All 5 QIs"]].map(([v,l]) => (
              <button key={v} onClick={() => setQi(v)}
                style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                  borderColor: qi===v?"#60a5fa":"#334155",
                  background: qi===v?"#1d4ed8":"#1e293b",
                  color: qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>
            Sort by
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[["uniqueness","Uniqueness"],["population","Population"]].map(([v,l]) => (
              <button key={v} onClick={() => setSortBy(v)}
                style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                  borderColor: sortBy===v?"#60a5fa":"#334155",
                  background: sortBy===v?"#1d4ed8":"#1e293b",
                  color: sortBy===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Area list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {sorted.map(a => {
          const pct = a[field];
          return (
            <div key={`${a.islandKey}-${a.name}`} style={{
              background:"#1e293b", borderRadius:8, padding:"12px 16px",
              display:"flex", alignItems:"center", gap:12,
              borderLeft:`3px solid ${a.islandColor}`,
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{a.name}</span>
                  <span style={{ color:"#475569", fontSize:11 }}>{a.islandName}</span>
                  <RiskBadge pct={pct}/>
                </div>
                <div style={{ background:"#0f172a", borderRadius:3, height:5 }}>
                  <div style={{
                    width:`${Math.min((pct/maxPct)*100, 100)}%`,
                    height:"100%", background:riskColor(pct), borderRadius:3, transition:"width 0.3s",
                  }}/>
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

// ── k-Anonymity ───────────────────────────────────────────────────────────────
export function KAnonTab() {
  const [qi, setQi] = useState("4qi");

  const chartData = Array.from({ length:20 }, (_, i) => ({
    k: i+1,
    ...Object.fromEntries(
      ISLAND_KEYS.map(k => [ISLANDS[k].name, ISLANDS[k].k_profiles[qi][i]])
    ),
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <div style={{ color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase" }}>
          QI Set
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[["3qi","Age + Sex"],["4qi","+ Occupation"],["5qi","All 5 QIs"]].map(([v,l]) => (
            <button key={v} onClick={() => setQi(v)}
              style={{ padding:"4px 10px", borderRadius:4, border:"1px solid",
                borderColor: qi===v?"#60a5fa":"#334155",
                background: qi===v?"#1d4ed8":"#1e293b",
                color: qi===v?"#fff":"#94a3b8", fontSize:11, cursor:"pointer" }}>
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
          k=1 intercept = uniqueness %. Jersey's larger population gives structural k-anonymity advantage.
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top:8, right:24, bottom:24, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="k" tick={{ fill:"#94a3b8", fontSize:11 }}
              label={{ value:"k (minimum group size)", position:"insideBottom",
                offset:-8, fill:"#64748b", fontSize:11 }}/>
            <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} tickFormatter={v => v+"%"} domain={[0,100]}/>
            <Tooltip content={<ChartTip/>} formatter={v => v.toFixed(2)+"%"}/>
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }}/>
            {ISLAND_KEYS.map(key => (
              <Line key={key} type="monotone" dataKey={ISLANDS[key].name}
                stroke={ISLANDS[key].color} strokeWidth={2} dot={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
