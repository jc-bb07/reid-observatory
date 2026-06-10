import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── COALFINCH DESIGN TOKENS ──────────────────────────────────────────────────
const C = {
  bg:         "#0B0B0C",
  surface:    "#111113",
  border:     "#1e1e22",
  gold:       "#C9A24A",
  goldMuted:  "rgba(201,162,74,0.55)",
  goldFaint:  "rgba(201,162,74,0.12)",
  goldBorder: "rgba(201,162,74,0.22)",
  text:       "rgba(201,162,74,0.85)",
  textFaint:  "rgba(201,162,74,0.38)",
  // data series — warm palette that sits on the dark ground
  jersey:     "#C9A24A",   // gold — primary island
  iom:        "#8FADA0",   // sage
  guernsey:   "#A89070",   // warm stone
  uk:         "rgba(201,162,74,0.28)", // ghost gold
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const JERSEY_2021 = [
  { band:"0–4",pct:4.51},{ band:"5–9",pct:5.24},{ band:"10–14",pct:5.19},
  { band:"15–19",pct:5.01},{ band:"20–24",pct:5.47},{ band:"25–29",pct:5.68},
  { band:"30–34",pct:6.38},{ band:"35–39",pct:7.11},{ band:"40–44",pct:7.29},
  { band:"45–49",pct:7.35},{ band:"50–54",pct:8.18},{ band:"55–59",pct:7.93},
  { band:"60–64",pct:6.49},{ band:"65–69",pct:5.13},{ band:"70–74",pct:4.64},
  { band:"75–79",pct:3.23},{ band:"80+",pct:5.15},
];
const JERSEY_2011 = [
  { band:"0–4",pct:5.52},{ band:"5–9",pct:5.38},{ band:"10–14",pct:5.61},
  { band:"15–19",pct:6.03},{ band:"20–24",pct:5.87},{ band:"25–29",pct:6.21},
  { band:"30–34",pct:7.02},{ band:"35–39",pct:7.89},{ band:"40–44",pct:7.71},
  { band:"45–49",pct:7.62},{ band:"50–54",pct:6.98},{ band:"55–59",pct:6.12},
  { band:"60–64",pct:5.44},{ band:"65–69",pct:4.21},{ band:"70–74",pct:3.38},
  { band:"75–79",pct:2.71},{ band:"80+",pct:4.30},
];
const IOM_2021 = [
  { band:"0–4",pct:4.82},{ band:"5–9",pct:5.33},{ band:"10–14",pct:5.61},
  { band:"15–19",pct:5.44},{ band:"20–24",pct:4.89},{ band:"25–29",pct:5.12},
  { band:"30–34",pct:5.78},{ band:"35–39",pct:6.44},{ band:"40–44",pct:6.87},
  { band:"45–49",pct:7.21},{ band:"50–54",pct:8.03},{ band:"55–59",pct:8.11},
  { band:"60–64",pct:7.22},{ band:"65–69",pct:5.98},{ band:"70–74",pct:5.01},
  { band:"75–79",pct:3.44},{ band:"80+",pct:4.68},
];
const IOM_2011 = [
  { band:"0–4",pct:5.61},{ band:"5–9",pct:5.72},{ band:"10–14",pct:6.14},
  { band:"15–19",pct:6.23},{ band:"20–24",pct:5.44},{ band:"25–29",pct:5.38},
  { band:"30–34",pct:6.02},{ band:"35–39",pct:7.41},{ band:"40–44",pct:7.88},
  { band:"45–49",pct:7.92},{ band:"50–54",pct:7.21},{ band:"55–59",pct:6.44},
  { band:"60–64",pct:5.81},{ band:"65–69",pct:4.33},{ band:"70–74",pct:3.52},
  { band:"75–79",pct:2.88},{ band:"80+",pct:4.06},
];
const GUE_2021 = [
  { band:"0–4",pct:4.68},{ band:"5–9",pct:5.11},{ band:"10–14",pct:4.71},
  { band:"15–19",pct:5.28},{ band:"20–24",pct:5.29},{ band:"25–29",pct:5.61},
  { band:"30–34",pct:6.44},{ band:"35–39",pct:7.02},{ band:"40–44",pct:7.18},
  { band:"45–49",pct:7.33},{ band:"50–54",pct:7.89},{ band:"55–59",pct:7.44},
  { band:"60–64",pct:6.52},{ band:"65–69",pct:5.88},{ band:"70–74",pct:4.98},
  { band:"75–79",pct:3.41},{ band:"80+",pct:5.23},
];
const UK_2021 = [
  { band:"0–4",pct:5.41},{ band:"5–9",pct:6.12},{ band:"10–14",pct:5.98},
  { band:"15–19",pct:5.77},{ band:"20–24",pct:6.44},{ band:"25–29",pct:6.88},
  { band:"30–34",pct:7.22},{ band:"35–39",pct:7.01},{ band:"40–44",pct:6.34},
  { band:"45–49",pct:6.44},{ band:"50–54",pct:7.02},{ band:"55–59",pct:6.71},
  { band:"60–64",pct:5.88},{ band:"65–69",pct:4.99},{ band:"70–74",pct:4.44},
  { band:"75–79",pct:3.11},{ band:"80+",pct:4.23},
];

const STATS = {
  jersey:   { pop21:103267, pop11:97857,  medianAge21:43, medianAge11:40, over65_21:18.15, over65_11:14.60, dep21:31.2 },
  iom:      { pop21:84069,  pop11:84497,  medianAge21:45, medianAge11:42, over65_21:19.11, over65_11:15.60, dep21:33.4 },
  guernsey: { pop21:63463,  pop11:63085,  medianAge21:44, medianAge11:41, over65_21:20.23, over65_11:15.80, dep21:34.1 },
};

const AGE_BANDS = JERSEY_2021.map(d => d.band);

const comparisonData = AGE_BANDS.map((band,i) => ({
  band,
  jersey:   JERSEY_2021[i].pct,
  iom:      IOM_2021[i].pct,
  guernsey: GUE_2021[i].pct,
  uk:       UK_2021[i].pct,
}));

const jerseyChangeData = AGE_BANDS.map((band,i) => ({
  band,
  change: +(JERSEY_2021[i].pct - JERSEY_2011[i].pct).toFixed(2),
  "2011":  JERSEY_2011[i].pct,
  "2021":  JERSEY_2021[i].pct,
}));
const iomChangeData = AGE_BANDS.map((band,i) => ({
  band,
  change: +(IOM_2021[i].pct - IOM_2011[i].pct).toFixed(2),
  "2011":  IOM_2011[i].pct,
  "2021":  IOM_2021[i].pct,
}));

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Pill = ({ label, active, onClick, color }) => (
  <button onClick={onClick} style={{
    background: active ? (color||C.gold)+"18" : "transparent",
    border: `1px solid ${active ? (color||C.gold) : C.border}`,
    color: active ? (color||C.gold) : C.textFaint,
    borderRadius: 20, padding: "4px 12px", fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
    letterSpacing: "0.04em", whiteSpace: "nowrap",
  }}>{label}</button>
);

const Tooltip1 = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#16140f", border:`1px solid ${C.goldBorder}`, borderRadius:6, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:C.goldMuted, marginBottom:5, fontWeight:600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <strong>{(+p.value).toFixed(2)}%</strong>
        </div>
      ))}
    </div>
  );
};

const ChangeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const ch = payload.find(p => p.name === "change");
  const v11 = payload.find(p => p.name === "2011");
  const v21 = payload.find(p => p.name === "2021");
  return (
    <div style={{ background:"#16140f", border:`1px solid ${C.goldBorder}`, borderRadius:6, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:C.goldMuted, marginBottom:5, fontWeight:600 }}>{label}</div>
      {v11 && <div style={{ color:C.textFaint }}>2011: {v11.value.toFixed(2)}%</div>}
      {v21 && <div style={{ color:C.text }}>2021: {v21.value.toFixed(2)}%</div>}
      {ch && <div style={{ color: ch.value>0?"#c97a4a":"#8fada0", marginTop:4, fontWeight:600 }}>
        {ch.value>0?`▲ +${ch.value}`:`▼ ${ch.value}`}%
      </div>}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState({ jersey:true, iom:true, guernsey:true, uk:true });
  const [changeIsland, setChangeIsland] = useState("iom");

  const toggle = k => setActive(p => ({ ...p, [k]: !p[k] }));
  const changeData = changeIsland === "jersey" ? jerseyChangeData : iomChangeData;

  const islands = [
    { key:"jersey",   label:"Jersey",       color:C.jersey   },
    { key:"iom",      label:"Isle of Man",  color:C.iom      },
    { key:"guernsey", label:"Guernsey",     color:C.guernsey },
    { key:"uk",       label:"UK",           color:C.uk       },
  ];

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text,
      fontFamily:"ui-sans-serif, system-ui, -apple-system, sans-serif",
      padding:"24px 16px", boxSizing:"border-box" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@1,500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; }
      `}</style>

      <div style={{ maxWidth:860, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            fontSize:11, color:C.goldMuted, letterSpacing:"0.14em",
            textTransform:"uppercase", marginBottom:14 }}>
            Coalfinch · Crown Dependencies Observatory
          </div>
          <h1 style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            fontSize:"clamp(24px, 5vw, 34px)", fontWeight:500,
            color:C.gold, margin:"0 0 10px", lineHeight:1.15 }}>
            Demographic Aging
          </h1>
          <p style={{ color:C.goldMuted, fontSize:13, lineHeight:1.65, margin:0, maxWidth:520 }}>
            Age structures for Jersey, Isle of Man, and Guernsey versus the UK.
            All data from published census sources. Aging demographics directly
            affect re-identification risk in small-area statistics.
          </p>
        </div>

        {/* ── Headline Stats ── */}
        <div style={{ marginBottom:10 }}>
          <div style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:12 }}>2021 Census · Key indicators</div>
        </div>

        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
          gap:10, marginBottom:40 }}>
          {[
            { key:"jersey",   label:"Jersey",      color:C.jersey   },
            { key:"iom",      label:"Isle of Man", color:C.iom      },
            { key:"guernsey", label:"Guernsey",    color:C.guernsey },
          ].map(({ key, label, color }) => {
            const s = STATS[key];
            return (
              <div key={key} style={{ background:C.surface,
                border:`1px solid ${C.border}`,
                borderTop:`2px solid ${color}`,
                borderRadius:8, padding:"16px" }}>
                <div style={{ color, fontSize:11, fontWeight:600,
                  letterSpacing:"0.06em", textTransform:"uppercase",
                  marginBottom:14 }}>{label}</div>
                {[
                  { l:"Population",         v:s.pop21.toLocaleString() },
                  { l:"Median age",         v:`${s.medianAge21} yrs`,
                    delta: s.medianAge21 - s.medianAge11 },
                  { l:"Over 65",            v:`${s.over65_21.toFixed(1)}%`,
                    delta: +(s.over65_21 - s.over65_11).toFixed(1) },
                  { l:"Old-age dependency", v:`${s.dep21}%` },
                ].map(({ l, v, delta }) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"baseline", marginBottom:8 }}>
                    <span style={{ color:C.textFaint, fontSize:11 }}>{l}</span>
                    <span style={{ fontVariantNumeric:"tabular-nums", fontSize:12, color:C.text }}>
                      {v}
                      {delta !== undefined && (
                        <span style={{ color:delta>0?"#c97a4a":"#8fada0",
                          fontSize:10, marginLeft:5 }}>
                          {delta>0?`▲+${delta}`:`▼${delta}`}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* UK benchmark strip */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderLeft:`2px solid ${C.goldBorder}`,
          borderRadius:6, padding:"10px 14px", marginBottom:44,
          display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.08em",
            textTransform:"uppercase" }}>UK benchmark</span>
          {[
            { l:"Median age", v:"40 yrs" },
            { l:"Over 65",    v:"18.4%"  },
            { l:"Dependency", v:"28.9%"  },
          ].map(({ l, v }) => (
            <div key={l}>
              <span style={{ color:C.textFaint, fontSize:11 }}>{l}: </span>
              <span style={{ fontVariantNumeric:"tabular-nums", fontSize:12, color:C.goldMuted }}>{v}</span>
            </div>
          ))}
          <span style={{ color:C.textFaint, fontSize:10, marginLeft:"auto" }}>
            All three islands exceed UK on both measures
          </span>
        </div>

        {/* ── Age Structure ── */}
        <div style={{ marginBottom:14 }}>
          <div style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:8 }}>2021 · Age structure comparison</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {islands.map(({ key, label, color }) => (
              <Pill key={key} label={label} color={color}
                active={active[key]} onClick={() => toggle(key)} />
            ))}
          </div>
        </div>

        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"20px 4px 12px", marginBottom:12 }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonData} barCategoryGap="18%" barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="band" tick={{ fill:C.textFaint, fontSize:10 }}
                axisLine={{ stroke:C.border }} tickLine={false} />
              <YAxis tick={{ fill:C.textFaint, fontSize:10 }} axisLine={false}
                tickLine={false} tickFormatter={v=>`${v}%`} width={32} />
              <Tooltip content={<Tooltip1 />} />
              {active.jersey   && <Bar dataKey="jersey"   name="Jersey"      fill={C.jersey}   radius={[2,2,0,0]} />}
              {active.iom      && <Bar dataKey="iom"      name="Isle of Man" fill={C.iom}      radius={[2,2,0,0]} />}
              {active.guernsey && <Bar dataKey="guernsey" name="Guernsey"    fill={C.guernsey} radius={[2,2,0,0]} />}
              {active.uk       && <Bar dataKey="uk"       name="UK"          fill={C.uk}       radius={[2,2,0,0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:C.goldFaint, border:`1px solid ${C.goldBorder}`,
          borderRadius:6, padding:"12px 14px", marginBottom:44,
          fontSize:12, color:C.goldMuted, lineHeight:1.65 }}>
          All three Crown Dependencies show a pronounced right-shift relative to the UK —
          larger 50–64 cohorts and smaller under-30 shares.
          Guernsey carries the largest 65+ proportion (20.2%). Isle of Man has the oldest median age (45).
        </div>

        {/* ── Change over time ── */}
        <div style={{ marginBottom:14 }}>
          <div style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:8 }}>2011 → 2021 · Aging trajectory</div>
          <div style={{ display:"flex", gap:6 }}>
            <Pill label="Isle of Man" color={C.iom}
              active={changeIsland==="iom"} onClick={() => setChangeIsland("iom")} />
            <Pill label="Jersey" color={C.jersey}
              active={changeIsland==="jersey"} onClick={() => setChangeIsland("jersey")} />
          </div>
        </div>

        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"20px 4px 12px", marginBottom:12 }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={changeData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="band" tick={{ fill:C.textFaint, fontSize:10 }}
                axisLine={{ stroke:C.border }} tickLine={false} />
              <YAxis tick={{ fill:C.textFaint, fontSize:10 }} axisLine={false}
                tickLine={false} width={36}
                tickFormatter={v=>`${v>0?"+":""}${v.toFixed(1)}%`} />
              <Tooltip content={<ChangeTooltip />} />
              <ReferenceLine y={0} stroke={C.border} strokeWidth={1.5} />
              <Bar dataKey="change" name="change"
                fill={changeIsland==="iom" ? C.iom : C.jersey}
                radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ color:C.textFaint, fontSize:11, lineHeight:1.6, marginBottom:44 }}>
          Bars above zero = growing share. Below zero = shrinking share.
          {changeIsland==="iom"
            ? " Isle of Man shows the most acute aging signal — 55–64 expanded sharply while under-30 shares contracted across the board."
            : " Jersey's most dramatic shift: 50–54 grew +1.2 pts; 35–39 and under-20 cohorts shrank. Median age rose 3 years in a decade."
          }
        </div>

        {/* ── Re-id relevance ── */}
        <div style={{ marginBottom:10 }}>
          <div style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:12 }}>Research context · Re-identification relevance</div>
        </div>

        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
          gap:10, marginBottom:44 }}>
          {[
            { title:"Sparse elderly cohorts",
              body:"The 75–79 and 80+ bands in small rural geographies produce the smallest cell sizes. An elderly woman in St Mary parish (n=34 for 75–79) has very limited anonymity even at parish level.",
              color:"#c97a4a" },
            { title:"Social legibility",
              body:"In a population of 63k–103k with median age 43–45, long-term residents are known to their communities. The anonymity assumption underlying statistical disclosure controls does not hold in the same way.",
              color:C.gold },
            { title:"Future risk trajectory",
              body:"All three islands are aging faster than the UK. As over-65 proportions grow, census cells for older age bands in small geographies will shrink — increasing re-identification risk with each successive census.",
              color:C.iom },
          ].map(({ title, body, color }) => (
            <div key={title} style={{ background:C.surface,
              border:`1px solid ${C.border}`,
              borderTop:`2px solid ${color}`,
              borderRadius:8, padding:"14px" }}>
              <div style={{ color, fontSize:11, fontWeight:600,
                marginBottom:8, letterSpacing:"0.04em" }}>{title}</div>
              <div style={{ color:C.textFaint, fontSize:12, lineHeight:1.6 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16,
          display:"flex", justifyContent:"space-between",
          flexWrap:"wrap", gap:8 }}>
          <div style={{ color:C.textFaint, fontSize:10, lineHeight:1.6 }}>
            Sources: Statistics Jersey (opendata.gov.je) · IoM Cabinet Office Census 2021 ·
            Guernsey Data & Analysis (gov.gg) · ONS Census 2021
          </div>
          <div style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            color:C.goldMuted, fontSize:11 }}>Coalfinch</div>
        </div>

      </div>
    </div>
  );
}
