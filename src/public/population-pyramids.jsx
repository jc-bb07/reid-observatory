import { useState, useEffect, useRef } from "react";

// ─── COALFINCH DESIGN TOKENS ──────────────────────────────────────────────────
const C = {
  bg:         "#0B0B0C",
  surface:    "#111113",
  border:     "#1e1e22",
  gold:       "#C9A24A",
  goldMuted:  "rgba(201,162,74,0.55)",
  goldFaint:  "rgba(201,162,74,0.10)",
  goldBorder: "rgba(201,162,74,0.22)",
  text:       "rgba(201,162,74,0.85)",
  textFaint:  "rgba(201,162,74,0.38)",
  male:       "#8FADA0",   // sage — cool contrast
  female:     "#C9A24A",   // gold — warm
  jersey:     "#C9A24A",
  iom:        "#8FADA0",
  guernsey:   "#A89070",
  uk:         "rgba(201,162,74,0.30)",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const BANDS = ["0–4","5–9","10–14","15–19","20–24","25–29","30–34","35–39",
               "40–44","45–49","50–54","55–59","60–64","65–69","70–74","75–79","80+"];

const DATA = {
  jersey: {
    2011: {
      m:[2.84,2.77,2.89,3.10,3.02,3.20,3.62,4.06,3.97,3.92,3.59,3.15,2.80,2.17,1.74,1.40,2.01],
      f:[2.68,2.61,2.72,2.93,2.85,3.01,3.40,3.83,3.74,3.70,3.39,2.97,2.64,2.04,1.64,1.31,2.29],
    },
    2021: {
      m:[2.35,2.65,2.55,2.57,2.84,2.89,3.19,3.54,3.64,3.65,4.10,3.97,3.15,2.47,2.21,1.52,2.12],
      f:[2.16,2.59,2.64,2.44,2.63,2.96,3.19,3.57,3.65,3.70,4.08,3.96,3.34,2.66,2.43,1.71,2.03],
    },
  },
  iom: {
    2011: {
      m:[2.89,2.95,3.16,3.21,2.80,2.77,3.10,3.82,4.06,4.08,3.71,3.32,2.99,2.23,1.81,1.48,1.93],
      f:[2.72,2.77,2.98,3.02,2.64,2.61,2.92,3.59,3.82,3.84,3.50,3.12,2.82,2.10,1.71,1.40,2.13],
    },
    2021: {
      m:[2.41,2.67,2.81,2.72,2.45,2.56,2.89,3.22,3.44,3.61,4.02,4.06,3.61,2.99,2.51,1.72,2.09],
      f:[2.41,2.66,2.80,2.72,2.44,2.56,2.89,3.22,3.43,3.60,4.01,4.05,3.61,2.99,2.50,1.72,2.59],
    },
  },
  guernsey: {
    2011: {
      m:[2.71,2.84,2.99,3.11,2.90,2.95,3.38,3.78,3.88,3.82,3.44,3.01,2.78,2.09,1.72,1.31,1.89],
      f:[2.61,2.74,2.88,3.00,2.80,2.85,3.26,3.65,3.74,3.68,3.32,2.91,2.68,2.02,1.66,1.26,2.11],
    },
    2021: {
      m:[2.34,2.56,2.36,2.64,2.65,2.81,3.22,3.51,3.59,3.67,3.95,3.72,3.26,2.94,2.49,1.71,2.27],
      f:[2.34,2.55,2.35,2.64,2.64,2.80,3.22,3.51,3.59,3.66,3.94,3.72,3.26,2.94,2.49,1.70,2.96],
    },
  },
  uk: {
    2011: {
      m:[3.14,3.09,2.94,3.18,3.51,3.57,3.56,3.68,3.57,3.54,3.20,2.84,2.48,1.97,1.52,1.12,1.49],
      f:[2.99,2.94,2.80,3.03,3.34,3.40,3.39,3.51,3.41,3.38,3.07,2.73,2.42,2.02,1.65,1.33,2.01],
    },
    2021: {
      m:[2.76,3.12,3.05,2.94,3.28,3.51,3.68,3.57,3.23,3.28,3.57,3.42,2.99,2.54,2.26,1.58,1.90],
      f:[2.65,2.99,2.93,2.83,3.16,3.37,3.54,3.44,3.11,3.16,3.45,3.29,2.89,2.45,2.18,1.53,2.33],
    },
  },
};

const META = {
  jersey:   { label:"Jersey",      pop:{2011:97857,  2021:103267}, median:{2011:40,2021:43}, color:C.jersey   },
  iom:      { label:"Isle of Man", pop:{2011:84497,  2021:84069 }, median:{2011:42,2021:45}, color:C.iom      },
  guernsey: { label:"Guernsey",    pop:{2011:63085,  2021:63463 }, median:{2011:41,2021:44}, color:C.guernsey },
  uk:       { label:"UK",          pop:{2011:53107169,2021:56489800},median:{2011:39,2021:40},color:C.uk      },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const lerp = (a,b,t) => a+(b-a)*t;
const lerpDS = (d1,d2,t) => ({
  m: d1.m.map((v,i) => lerp(v,d2.m[i],t)),
  f: d1.f.map((v,i) => lerp(v,d2.f[i],t)),
});

// ─── PYRAMID SVG ─────────────────────────────────────────────────────────────
function Pyramid({ islandKey, data, overlayData, compact }) {
  const meta = META[islandKey];
  const maxVal = 5.5;
  const barH   = compact ? 11 : 15;
  const gap    = 2;
  const totalH = BANDS.length * (barH + gap);
  // Responsive width via viewBox scaling — SVG handles it
  const svgW   = 340;
  const labelW = 36;
  const chartW = (svgW - labelW*2 - 8) / 2;
  const cx     = labelW + chartW + 4;

  return (
    <div style={{ flex:1, minWidth:0 }}>
      {/* Island label */}
      <div style={{ textAlign:"center", marginBottom:8 }}>
        <span style={{ color:meta.color, fontSize:compact?10:12, fontWeight:600,
          letterSpacing:"0.07em", textTransform:"uppercase",
          borderBottom:`1px solid ${meta.color}44`, paddingBottom:2 }}>
          {meta.label}
        </span>
      </div>

      {/* M/F header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        paddingLeft:labelW+4, paddingRight:labelW+4, marginBottom:3 }}>
        <span style={{ color:C.male,   fontSize:9, fontWeight:600 }}>◀ M</span>
        <span style={{ color:C.female, fontSize:9, fontWeight:600 }}>F ▶</span>
      </div>

      <svg width="100%" viewBox={`0 0 ${svgW} ${totalH}`}
        style={{ display:"block", overflow:"visible" }}>

        {BANDS.map((band,i) => {
          // i=0 = youngest (0–4) → bottom; i=16 = oldest (80+) → top
          const y  = (BANDS.length - 1 - i) * (barH + gap);
          const mW = (data.m[i] / maxVal) * chartW;
          const fW = (data.f[i] / maxVal) * chartW;
          const mOvW = overlayData ? (overlayData.m[i]/maxVal)*chartW : 0;
          const fOvW = overlayData ? (overlayData.f[i]/maxVal)*chartW : 0;

          return (
            <g key={band}>
              {/* Solid bars — current */}
              <rect x={cx-mW} y={y} width={mW} height={barH}
                fill={C.male} opacity={0.7} rx={1}/>
              <rect x={cx}    y={y} width={fW} height={barH}
                fill={C.female} opacity={0.7} rx={1}/>

              {/* Ghost outlines — 2011 */}
              {overlayData && <>
                <rect x={cx-mOvW} y={y} width={mOvW} height={barH}
                  fill="none" stroke={C.male} strokeWidth={0.8}
                  strokeDasharray="3 2" opacity={0.4} rx={1}/>
                <rect x={cx} y={y} width={fOvW} height={barH}
                  fill="none" stroke={C.female} strokeWidth={0.8}
                  strokeDasharray="3 2" opacity={0.4} rx={1}/>
              </>}

              {/* Age label */}
              <text x={cx-3} y={y+barH*0.74} textAnchor="end"
                fill={C.textFaint} fontSize={compact?7.5:9}>{band}</text>
            </g>
          );
        })}

        {/* Centre line */}
        <line x1={cx} y1={0} x2={cx} y2={totalH}
          stroke={C.border} strokeWidth={1}/>
      </svg>

      {/* Ghost legend */}
      {overlayData && (
        <div style={{ display:"flex", justifyContent:"center", gap:12,
          fontSize:9, color:C.textFaint, marginTop:5 }}>
          <span>── 2021</span><span>╌╌ 2011</span>
        </div>
      )}
    </div>
  );
}

// ─── STATS ROW ────────────────────────────────────────────────────────────────
function StatsRow({ keys, t }) {
  return (
    <div style={{ display:"grid",
      gridTemplateColumns:`repeat(${keys.length}, 1fr)`,
      gap:8, marginTop:10 }}>
      {keys.map(k => {
        const meta  = META[k];
        const d     = lerpDS(DATA[k][2011], DATA[k][2021], t);
        const over65 = [...d.m.slice(13),...d.f.slice(13)].reduce((a,b)=>a+b,0);
        const median = lerp(meta.median[2011], meta.median[2021], t);
        const pop    = Math.round(lerp(meta.pop[2011], meta.pop[2021], t));
        return (
          <div key={k} style={{ background:C.surface, border:`1px solid ${C.border}`,
            borderTop:`2px solid ${meta.color}`, borderRadius:7, padding:"10px 12px" }}>
            <div style={{ color:meta.color, fontSize:9, fontWeight:600,
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>
              {meta.label}
            </div>
            {[
              { l:"Pop",      v: k==="uk" ? (pop/1e6).toFixed(1)+"M" : pop.toLocaleString() },
              { l:"Median",   v: `${median.toFixed(1)} yrs`, highlight:true },
              { l:"65+",      v: `${over65.toFixed(1)}%`    },
            ].map(({ l, v, highlight }) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between",
                marginBottom:4 }}>
                <span style={{ color:C.textFaint, fontSize:10 }}>{l}</span>
                <span style={{ fontVariantNumeric:"tabular-nums", fontSize:10,
                  color: highlight ? meta.color : C.text }}>{v}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── PILL BUTTON ─────────────────────────────────────────────────────────────
const Pill = ({ label, active, onClick, color, small }) => (
  <button onClick={onClick} style={{
    background: active ? (color||C.gold)+"18" : "transparent",
    border: `1px solid ${active ? (color||C.gold) : C.border}`,
    color:  active ? (color||C.gold) : C.textFaint,
    borderRadius:20, padding: small?"3px 10px":"5px 13px",
    fontSize: small?10:11, cursor:"pointer",
    fontFamily:"inherit", transition:"all 0.15s",
    letterSpacing:"0.04em", whiteSpace:"nowrap",
  }}>{label}</button>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const MODES = { SINGLE:"single", DUAL:"dual", QUAD:"quad" };
  const [mode,        setMode]        = useState(MODES.SINGLE);
  const [singleKey,   setSingleKey]   = useState("iom");
  const [dualA,       setDualA]       = useState("iom");
  const [dualB,       setDualB]       = useState("jersey");
  const [sliderVal,   setSliderVal]   = useState(100); // 0=2011, 100=2021
  const [playing,     setPlaying]     = useState(false);
  const rafRef = useRef(null);

  const ANIM_MS = 1800;

  useEffect(() => {
    if (playing) {
      const from  = sliderVal;
      const to    = sliderVal < 50 ? 100 : 0;
      const start = performance.now();
      const tick  = now => {
        const raw    = Math.min((now-start)/ANIM_MS, 1);
        const eased  = raw<0.5 ? 2*raw*raw : -1+(4-2*raw)*raw;
        const newVal = lerp(from, to, eased);
        setSliderVal(newVal);
        if (raw < 1) rafRef.current = requestAnimationFrame(tick);
        else setPlaying(false);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [playing]);

  const t    = sliderVal / 100;
  const year = Math.round(lerp(2011, 2021, t));
  const showOverlay = sliderVal > 4 && sliderVal < 96;

  const getInterp = k => lerpDS(DATA[k][2011], DATA[k][2021], t);

  const islandKeys = Object.keys(META);
  const islandOpts = islandKeys.map(k => [k, META[k].label]);

  const activeKeys = mode===MODES.SINGLE ? [singleKey]
                   : mode===MODES.DUAL   ? [dualA, dualB]
                   : islandKeys;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text,
      fontFamily:"ui-sans-serif, system-ui, -apple-system, sans-serif",
      padding:"20px 14px", boxSizing:"border-box" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@1,500&display=swap');
        * { box-sizing:border-box; }
        input[type=range] { -webkit-appearance:none; appearance:none; width:100%;
          height:3px; background:${C.border}; border-radius:2px; outline:none; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px;
          height:14px; border-radius:50%; background:${C.gold}; cursor:pointer; }
        input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%;
          background:${C.gold}; cursor:pointer; border:none; }
        select { background:${C.surface}; border:1px solid ${C.border};
          color:${C.text}; border-radius:6px; padding:5px 8px;
          font-size:12px; cursor:pointer; font-family:inherit; }
      `}</style>

      <div style={{ maxWidth:880, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            fontSize:10, color:C.goldMuted, letterSpacing:"0.14em",
            textTransform:"uppercase", marginBottom:10 }}>
            Coalfinch · Crown Dependencies Observatory
          </div>
          <h1 style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            fontSize:"clamp(22px,5vw,30px)", fontWeight:500,
            color:C.gold, margin:"0 0 6px", lineHeight:1.15 }}>
            Population Structure Explorer
          </h1>
          <p style={{ color:C.goldMuted, fontSize:12, margin:0 }}>
            2011 → 2021 · Jersey, Isle of Man, Guernsey, UK
          </p>
        </div>

        {/* ── Controls ── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:10, padding:"14px 16px", marginBottom:20,
          display:"flex", flexDirection:"column", gap:14 }}>

          {/* Mode */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.08em",
              textTransform:"uppercase", marginRight:2 }}>View</span>
            {[
              [MODES.SINGLE,"Single"],
              [MODES.DUAL,  "Side by side"],
              [MODES.QUAD,  "All four"],
            ].map(([m,l]) => (
              <Pill key={m} label={l} active={mode===m} onClick={()=>setMode(m)} />
            ))}
          </div>

          {/* Island selectors */}
          {mode===MODES.SINGLE && (
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ color:C.textFaint, fontSize:10, letterSpacing:"0.08em",
                textTransform:"uppercase" }}>Island</span>
              {islandKeys.map(k => (
                <Pill key={k} small label={META[k].label} color={META[k].color}
                  active={singleKey===k} onClick={()=>setSingleKey(k)} />
              ))}
            </div>
          )}
          {mode===MODES.DUAL && (
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ color:C.textFaint, fontSize:10, textTransform:"uppercase",
                letterSpacing:"0.08em" }}>Compare</span>
              <select value={dualA} onChange={e=>setDualA(e.target.value)}>
                {islandOpts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <span style={{ color:C.textFaint }}>vs</span>
              <select value={dualB} onChange={e=>setDualB(e.target.value)}>
                {islandOpts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          )}

          {/* Year + slider */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ color:C.textFaint, fontSize:10, textTransform:"uppercase",
                letterSpacing:"0.08em" }}>Year</span>
              <Pill small label="2011" active={!playing&&sliderVal===0}
                onClick={()=>{setPlaying(false);setSliderVal(0);}} />
              <Pill small label="2021" active={!playing&&sliderVal===100}
                onClick={()=>{setPlaying(false);setSliderVal(100);}} />
              <button onClick={()=>setPlaying(p=>!p)} style={{
                background: playing ? C.gold+"22" : C.gold,
                border:`1px solid ${C.gold}`,
                color: playing ? C.gold : C.bg,
                borderRadius:6, padding:"3px 12px", fontSize:10,
                cursor:"pointer", fontFamily:"inherit", fontWeight:600,
                letterSpacing:"0.08em",
              }}>{playing?"■ Stop":"▶ Animate"}</button>
              <span style={{ fontVariantNumeric:"tabular-nums", fontSize:20,
                color:C.gold, minWidth:38, textAlign:"right" }}>{year}</span>
            </div>
            <div>
              <input type="range" min={0} max={100} step={0.5}
                value={sliderVal}
                onChange={e=>{setPlaying(false);setSliderVal(+e.target.value);}}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                <span style={{ color:C.textFaint, fontSize:9 }}>2011</span>
                <span style={{ color:C.textFaint, fontSize:9 }}>2021</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
            {[
              { col:C.male,   label:"Male"   },
              { col:C.female, label:"Female" },
            ].map(({ col, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:6, background:col,
                  borderRadius:1, opacity:0.7 }}/>
                <span style={{ color:C.textFaint, fontSize:10 }}>{label}</span>
              </div>
            ))}
            {showOverlay && (
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <svg width="20" height="6">
                  <line x1="0" y1="3" x2="20" y2="3"
                    stroke={C.textFaint} strokeWidth="1.2" strokeDasharray="4 2"/>
                </svg>
                <span style={{ color:C.textFaint, fontSize:10 }}>2011 outline</span>
              </div>
            )}
            <span style={{ color:C.textFaint, fontSize:10, marginLeft:"auto" }}>
              % of total population
            </span>
          </div>
        </div>

        {/* ── Pyramids ── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:10, padding:"20px 12px",
          display:"flex",
          flexDirection: mode===MODES.QUAD ? "row" : "row",
          flexWrap: mode===MODES.QUAD ? "wrap" : "nowrap",
          gap: mode===MODES.QUAD ? 10 : 20,
          justifyContent:"center", alignItems:"flex-start",
          overflowX: mode===MODES.DUAL||mode===MODES.QUAD ? "auto" : "visible",
        }}>
          {activeKeys.map(k => (
            <Pyramid key={k} islandKey={k}
              data={getInterp(k)}
              overlayData={showOverlay ? DATA[k][2011] : null}
              compact={mode!==MODES.SINGLE}/>
          ))}
        </div>

        {/* Stats */}
        <StatsRow keys={activeKeys} t={t} />

        {/* Insight */}
        <div style={{ marginTop:16, background:C.goldFaint,
          border:`1px solid ${C.goldBorder}`,
          borderRadius:8, padding:"12px 14px",
          display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ color:C.gold, fontSize:14, marginTop:1 }}>◈</span>
          <div style={{ fontSize:11, color:C.goldMuted, lineHeight:1.7 }}>
            <span style={{ color:C.text, fontWeight:600 }}>What to look for: </span>
            Animate 2011→2021 to watch the cohort bulge move upward — large working-age
            cohorts of 2011 are now in their 50s and 60s. In quad mode, compare the UK's
            more balanced structure against the Crown Dependencies' top-heavy profiles.{" "}
            <span style={{ color:C.gold }}>
              Guernsey carries the highest over-65 share (&gt;20%) in the smallest
              population — its rural parishes are the most re-identification-exposed
              geography across the three islands.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14,
          marginTop:24, display:"flex", justifyContent:"space-between",
          flexWrap:"wrap", gap:6 }}>
          <div style={{ color:C.textFaint, fontSize:10, lineHeight:1.6 }}>
            Sources: Statistics Jersey · IoM Cabinet Office · Guernsey Data &amp; Analysis · ONS
          </div>
          <div style={{ fontFamily:"'Libre Bodoni', serif", fontStyle:"italic",
            color:C.goldMuted, fontSize:11 }}>Coalfinch</div>
        </div>

      </div>
    </div>
  );
}
