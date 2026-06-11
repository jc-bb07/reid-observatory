import { useState, useMemo } from "react";
import {
  ISLANDS, AGE_BANDS, OCCUPATIONS, QI_DEFINITIONS,
  IOM_CENSUS_CELLS, IOM_MANX_LANGUAGE, IOM_ETHNICITY,
} from "../data/constants";
import attackLookup from "../data/attackLookup.json";

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  select: {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 6, padding: "8px 10px", color: "#f1f5f9", fontSize: 13,
  },
  label: {
    color: "#64748b", fontSize: 10, marginBottom: 4, textTransform: "uppercase",
  },
  card: { background: "#1e293b", borderRadius: 10, padding: 20 },
};

// ── Data badge ────────────────────────────────────────────────────────────────
function DataBadge({ type }) {
  const cfg = {
    published_exact:   { label: "Published exact",   color: "#22c55e", bg: "#052e16" },
    modelled_estimate: { label: "Modelled estimate", color: "#f59e0b", bg: "#1c1003" },
    synthetic:         { label: "Synthetic model",   color: "#a78bfa", bg: "#1e1040" },
  }[type] ?? { label: type, color: "#64748b", bg: "#1e293b" };

  return (
    <span style={{
      background: cfg.bg, color: cfg.color, fontSize: 9, fontWeight: 700,
      padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em",
      border: `1px solid ${cfg.color}33`,
    }}>
      {cfg.label}
    </span>
  );
}

// ── QI pill ───────────────────────────────────────────────────────────────────
function QIPill({ qi, active, available, islandKey, onToggle }) {
  const def = QI_DEFINITIONS[qi];
  const wrongIsland = def.iomOnly && islandKey !== "iom";
  const locked = (!available || wrongIsland) && !active;
  const lockedReason = wrongIsland
    ? "IoM only — not yet available for other islands"
    : def.additionalDataNote
      ? "Requires Additional Data mode"
      : null;

  return (
    <button
      onClick={() => !locked && onToggle(qi)}
      title={locked ? lockedReason : def.description || def.label}
      style={{
        padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        border: `1px solid ${active ? "#60a5fa" : locked ? "#1e293b" : "#334155"}`,
        background: active ? "#1d4ed8" : locked ? "#0a0f1a" : "#1e293b",
        color: active ? "#fff" : locked ? "#334155" : "#94a3b8",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: 5,
      }}
    >
      {def.label}
      {locked && <span style={{ fontSize: 9, color: "#475569" }}>🔒</span>}
      {!locked && def.requiresAdditionalData && (
        <span style={{ fontSize: 9, color: active ? "#93c5fd" : "#64748b" }}>~</span>
      )}
    </button>
  );
}

// ── Count functions ───────────────────────────────────────────────────────────

function getCensusCount(island, area, ageBand, sex) {
  if (island !== "iom") return null;
  const areaCells = IOM_CENSUS_CELLS[area];
  if (!areaCells) return null;
  if (!ageBand) return areaCells[Object.keys(areaCells)[0]]["All"]
    ? Object.values(areaCells).reduce((s, sexObj) => s + (sexObj.All || 0), 0)
    : null;
  const ageCells = areaCells[ageBand];
  if (!ageCells) return 0;
  if (!sex) return ageCells.All ?? 0;
  return ageCells[sex] ?? 0;
}

function getAreaTotal(island, area) {
  // For published mode: use census cells total for IoM, area population otherwise
  if (island === "iom") {
    const areaCells = IOM_CENSUS_CELLS[area];
    if (areaCells) {
      return Object.values(areaCells).reduce((areaSum, ageBands) => {
        return areaSum + Object.entries(ageBands)
          .filter(([sex]) => sex === "All")
          .reduce((s, [, v]) => s + v, 0);
      }, 0);
    }
  }
  return ISLANDS[island]?.areas.find(a => a.name === area)?.population ?? 0;
}

function getSyntheticCount(island, area, ageBand, sex, occupation, hhSize) {
  let rows = attackLookup.filter(r => r.island === island && r.area === area);
  const n1 = rows.reduce((s, r) => s + r.count, 0);
  if (ageBand) rows = rows.filter(r => r.age_band === ageBand);
  const n2 = rows.reduce((s, r) => s + r.count, 0);
  if (sex) rows = rows.filter(r => r.sex === sex);
  const n3 = rows.reduce((s, r) => s + r.count, 0);
  if (occupation) rows = rows.filter(r => r.occupation === occupation);
  const n4 = rows.reduce((s, r) => s + r.count, 0);
  if (hhSize) rows = rows.filter(r => r.hh_size === Number(hhSize));
  const n5 = rows.reduce((s, r) => s + r.count, 0);
  return { n1, n2, n3, n4, n5 };
}

// ── Step builder ──────────────────────────────────────────────────────────────
// Each step takes the previous count as its pool and multiplies by the
// conditional probability of the new attribute. For published census data
// on IoM, we use exact cells. For everything else, we use proportional
// reduction from the synthetic model or from published island-wide rates.

function buildSteps({ island, area, ageBand, sex, occupation, hhSize,
                      manxSpeaker, nonWhiteEthnicity, activeQIs, dataMode }) {
  const usePublished = dataMode === "published";
  const steps = [];

  // ── 1. Area ──
  if (!area) return steps;

  const areaPop = ISLANDS[island]?.areas.find(a => a.name === area)?.population ?? 0;
  const areaCount = usePublished ? getAreaTotal(island, area) : (() => {
    const rows = attackLookup.filter(r => r.island === island && r.area === area);
    return rows.reduce((s, r) => s + r.count, 0);
  })();

  if (activeQIs.includes("area")) {
    steps.push({
      qi: "area",
      label: "Area identified",
      desc: `${area}, ${ISLANDS[island].name}`,
      count: areaCount,
      dataType: usePublished ? (island === "iom" ? "published_exact" : "modelled_estimate") : "synthetic",
      source: QI_DEFINITIONS.area.source,
      citation: QI_DEFINITIONS.area.censusTable,
    });
  }

  let currentPool = areaCount;

  // ── 2. Manx language (if selected, applied early — shrinks pool dramatically) ──
  if (activeQIs.includes("manx_language") && manxSpeaker && island === "iom") {
    const langData = IOM_MANX_LANGUAGE[area];
    if (langData) {
      const manxCount = langData.total_any_manx;
      steps.push({
        qi: "manx_language",
        label: "Manx language ability applied",
        desc: `Filter to residents with any Manx language ability`,
        count: manxCount,
        dataType: "published_exact",
        source: QI_DEFINITIONS.manx_language.source,
        citation: QI_DEFINITIONS.manx_language.censusTable,
        contextNote: `${manxCount} of ${areaPop.toLocaleString()} residents (${((manxCount/areaPop)*100).toFixed(1)}%) have any Manx ability`,
      });
      currentPool = manxCount;
    }
  }

  // ── 3. Ethnicity (if selected) ──
  if (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity && island === "iom") {
    const ethData = IOM_ETHNICITY[area];
    if (ethData) {
      const ethCount = ethData.non_white_estimate;
      steps.push({
        qi: "ethnicity_nonwhite",
        label: "Non-white ethnicity applied",
        desc: `Filter to non-white residents`,
        count: ethCount,
        dataType: "modelled_estimate",
        source: QI_DEFINITIONS.ethnicity_nonwhite.source,
        citation: QI_DEFINITIONS.ethnicity_nonwhite.censusTable,
        caveat: ethData.caveat,
        contextNote: `Est. ${ethCount} of ${areaPop.toLocaleString()} residents (${((ethCount/areaPop)*100).toFixed(1)}%) are non-white`,
      });
      currentPool = ethCount;
    }
  }

  // ── 4. Age band ──
  if (activeQIs.includes("age") && ageBand) {
    let count;
    let dataType;

    if (activeQIs.includes("manx_language") && manxSpeaker) {
      // Age breakdown within Manx speakers not published — apply island-wide age rate
      const islandAgeCells = IOM_CENSUS_CELLS;
      const islandTotal = Object.values(islandAgeCells).reduce((s, area) =>
        s + (area[ageBand]?.All ?? 0), 0);
      const islandPop = ISLANDS[island].population;
      const ageRate = islandTotal / islandPop;
      count = Math.round(currentPool * ageRate);
      dataType = "modelled_estimate";
    } else if (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity) {
      // Age breakdown within non-white not published — apply island-wide rate
      const islandAgeCells = IOM_CENSUS_CELLS;
      const islandTotal = Object.values(islandAgeCells).reduce((s, area) =>
        s + (area[ageBand]?.All ?? 0), 0);
      count = Math.round(currentPool * (islandTotal / ISLANDS[island].population));
      dataType = "modelled_estimate";
    } else if (usePublished && island === "iom") {
      count = getCensusCount(island, area, ageBand, null);
      dataType = "published_exact";
    } else {
      const s = getSyntheticCount(island, area, ageBand, null, null, null);
      count = s.n2;
      dataType = usePublished ? "modelled_estimate" : "synthetic";
    }

    steps.push({
      qi: "age",
      label: "Age band applied",
      desc: `Filter to ${ageBand} age group`,
      count: Math.max(0, count),
      dataType,
      source: QI_DEFINITIONS.age.source,
      citation: (dataType === "published_exact") ? QI_DEFINITIONS.age.censusTable : null,
    });
    currentPool = Math.max(0, count);
  }

  // ── 5. Sex ──
  if (activeQIs.includes("sex") && sex) {
    let count;
    let dataType;

    const hasSpecialFilter = (activeQIs.includes("manx_language") && manxSpeaker) ||
                             (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity);

    if (hasSpecialFilter) {
      // Apply ~50/50 sex split as approximation (no published cross-tab)
      count = Math.round(currentPool * 0.5);
      dataType = "modelled_estimate";
    } else if (usePublished && island === "iom" && ageBand) {
      count = getCensusCount(island, area, ageBand, sex);
      dataType = "published_exact";
    } else if (usePublished && island === "iom" && !ageBand) {
      // Sex without age — use area totals from cells
      const areaCells = IOM_CENSUS_CELLS[area];
      count = areaCells
        ? Object.values(areaCells).reduce((s, bands) => s + (bands[sex] ?? 0), 0)
        : Math.round(currentPool * 0.5);
      dataType = "published_exact";
    } else {
      const s = getSyntheticCount(island, area, ageBand, sex, null, null);
      count = s.n3;
      dataType = usePublished ? "modelled_estimate" : "synthetic";
    }

    steps.push({
      qi: "sex",
      label: "Sex applied",
      desc: `Filter to ${sex}`,
      count: Math.max(0, count),
      dataType,
      source: QI_DEFINITIONS.sex.source,
      citation: (dataType === "published_exact") ? QI_DEFINITIONS.sex.censusTable : null,
    });
    currentPool = Math.max(0, count);
  }

  // ── 6. Occupation (synthetic only) ──
  if (activeQIs.includes("occupation") && occupation) {
    const s = getSyntheticCount(island, area, ageBand, sex, occupation, null);
    steps.push({
      qi: "occupation",
      label: "Occupation applied",
      desc: `Filter to ${occupation}`,
      count: s.n4,
      dataType: "synthetic",
      source: QI_DEFINITIONS.occupation.source,
      citation: null,
      caveat: QI_DEFINITIONS.occupation.additionalDataNote,
    });
    currentPool = s.n4;
  }

  // ── 7. Household size (synthetic only) ──
  if (activeQIs.includes("hh_size") && hhSize) {
    const prevOcc = activeQIs.includes("occupation") ? occupation : null;
    const s = getSyntheticCount(island, area, ageBand, sex, prevOcc, hhSize);
    steps.push({
      qi: "hh_size",
      label: "Household size applied",
      desc: `Filter to household of ${hhSize}${hhSize === "6" ? " or more" : ""}`,
      count: s.n5,
      dataType: "synthetic",
      source: QI_DEFINITIONS.hh_size.source,
      citation: null,
      caveat: QI_DEFINITIONS.hh_size.additionalDataNote,
    });
  }

  return steps;
}

// ── Step colour ───────────────────────────────────────────────────────────────
function stepColor(count, isLast) {
  if (!isLast) return "#64748b";
  if (count <= 1)  return "#ef4444";
  if (count <= 5)  return "#f97316";
  if (count <= 20) return "#eab308";
  return "#22c55e";
}

// ── Main component ────────────────────────────────────────────────────────────
export function AttackSimulator() {
  const [island,           setIsland]           = useState("iom");
  const [area,             setArea]             = useState("");
  const [ageBand,          setAgeBand]          = useState("");
  const [sex,              setSex]              = useState("");
  const [occupation,       setOccupation]       = useState("");
  const [hhSize,           setHhSize]           = useState("");
  const [manxSpeaker,      setManxSpeaker]      = useState(false);
  const [nonWhiteEthnicity,setNonWhiteEthnicity]= useState(false);

  const [dataMode,   setDataMode]   = useState("published");
  const [activeQIs,  setActiveQIs]  = useState(["area", "age", "sex"]);
  const [steps,      setSteps]      = useState([]);
  const [running,    setRunning]    = useState(false);
  const [hasRun,     setHasRun]     = useState(false);

  const islandData   = ISLANDS[island];
  const useAdditional = dataMode === "additional";

  // QIs available given data mode and island
  const availableQIs = useMemo(() => {
    return Object.keys(QI_DEFINITIONS).filter(qi => {
      const def = QI_DEFINITIONS[qi];
      if (def.iomOnly && island !== "iom") return false;
      if (def.requiresAdditionalData && !useAdditional) return false;
      return true;
    });
  }, [dataMode, island]);

  const handleDataModeChange = (mode) => {
    setDataMode(mode);
    if (mode === "published") {
      setActiveQIs(prev =>
        prev.filter(qi => !QI_DEFINITIONS[qi].requiresAdditionalData)
      );
      setOccupation("");
      setHhSize("");
    }
    setSteps([]);
    setHasRun(false);
  };

  const handleIslandChange = (newIsland) => {
    setIsland(newIsland);
    setArea("");
    setActiveQIs(prev =>
      prev.filter(qi => {
        const def = QI_DEFINITIONS[qi];
        if (def.iomOnly && newIsland !== "iom") return false;
        return true;
      })
    );
    setManxSpeaker(false);
    setNonWhiteEthnicity(false);
    setSteps([]);
    setHasRun(false);
  };

  const toggleQI = (qi) => {
    setActiveQIs(prev =>
      prev.includes(qi) ? prev.filter(q => q !== qi) : [...prev, qi]
    );
    // Clear the value if deactivating
    if (qi === "manx_language") setManxSpeaker(false);
    if (qi === "ethnicity_nonwhite") setNonWhiteEthnicity(false);
    setSteps([]);
    setHasRun(false);
  };

  const resetResults = () => { setSteps([]); setHasRun(false); };

  const canRun = area && activeQIs.length > 1;

  const runSimulation = async () => {
    if (!canRun || running) return;
    setRunning(true);
    setSteps([]);
    setHasRun(false);

    const built = buildSteps({
      island, area, ageBand, sex, occupation, hhSize,
      manxSpeaker, nonWhiteEthnicity, activeQIs, dataMode,
    });

    for (let i = 0; i < built.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setSteps(prev => [...prev, built[i]]);
    }
    setRunning(false);
    setHasRun(true);
  };

  const finalCount = steps.length > 0 ? steps[steps.length - 1].count : null;

  // Context info for special QIs when area is selected
  const manxContext  = area && island === "iom" ? IOM_MANX_LANGUAGE[area]  : null;
  const ethContext   = area && island === "iom" ? IOM_ETHNICITY[area]       : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={S.card}>
        <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:15, marginBottom:4 }}>
          Attack Chain Simulator
        </div>
        <div style={{ color:"#64748b", fontSize:12, lineHeight:1.6 }}>
          Simulates a step-by-step re-identification attack using publicly available data.
          No hacking. No breach. Just open data and a spreadsheet.
        </div>
      </div>

      {/* Data mode toggle */}
      <div style={{ background:"#1e293b", borderRadius:10, padding:16 }}>
        <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:10,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>
          Data Source
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[
            { id:"published",
              label:"Published Census Only",
              desc:"Exact cell counts from published government tables. Every number directly citable." },
            { id:"additional",
              label:"+ Additional Data",
              desc:"Supplements with synthetic population model. Enables occupation and household size. Synthetic counts clearly labelled." },
          ].map(opt => (
            <button key={opt.id} onClick={() => handleDataModeChange(opt.id)} style={{
              flex:1, padding:"10px 14px", borderRadius:8, border:"1px solid",
              borderColor: dataMode === opt.id ? "#60a5fa" : "#334155",
              background: dataMode === opt.id ? "#0f2340" : "#0f172a",
              color: dataMode === opt.id ? "#e2e8f0" : "#64748b",
              cursor:"pointer", textAlign:"left",
            }}>
              <div style={{ fontWeight:600, fontSize:12, marginBottom:3 }}>{opt.label}</div>
              <div style={{ fontSize:10, lineHeight:1.5,
                color: dataMode === opt.id ? "#94a3b8" : "#475569" }}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>

        {/* QI pills */}
        <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:8,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>
          Quasi-Identifiers
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
          {Object.keys(QI_DEFINITIONS).map(qi => (
            <QIPill
              key={qi}
              qi={qi}
              active={activeQIs.includes(qi)}
              available={availableQIs.includes(qi)}
              islandKey={island}
              onToggle={toggleQI}
            />
          ))}
        </div>
        <div style={{ color:"#475569", fontSize:10 }}>
          ~ synthetic model &nbsp;·&nbsp; 🔒 requires Additional Data or IoM only
        </div>
      </div>

      {/* Inputs */}
      <div style={S.card}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>

          {/* Island */}
          <div>
            <div style={S.label}>Island</div>
            <select value={island} onChange={e => handleIslandChange(e.target.value)}
              style={S.select}>
              {Object.keys(ISLANDS).map(k => (
                <option key={k} value={k}>{ISLANDS[k].name}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <div style={S.label}>Area / Parish</div>
            <select value={area}
              onChange={e => { setArea(e.target.value); resetResults(); }}
              style={S.select}>
              <option value="">Select area…</option>
              {[...islandData.areas]
                .sort((a,b) => a.population - b.population)
                .map(a => (
                  <option key={a.name} value={a.name}>
                    {a.name} (pop {a.population.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>

          {/* Age */}
          {activeQIs.includes("age") && (
            <div>
              <div style={S.label}>Age Band</div>
              <select value={ageBand}
                onChange={e => { setAgeBand(e.target.value); resetResults(); }}
                style={S.select}>
                <option value="">Select…</option>
                {AGE_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          {/* Sex */}
          {activeQIs.includes("sex") && (
            <div>
              <div style={S.label}>Sex</div>
              <select value={sex}
                onChange={e => { setSex(e.target.value); resetResults(); }}
                style={S.select}>
                <option value="">Select…</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          )}

          {/* Occupation */}
          {activeQIs.includes("occupation") && useAdditional && (
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                Occupation <DataBadge type="synthetic"/>
              </div>
              <select value={occupation}
                onChange={e => { setOccupation(e.target.value); resetResults(); }}
                style={S.select}>
                <option value="">Select…</option>
                {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {/* Household size */}
          {activeQIs.includes("hh_size") && useAdditional && (
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                Household Size <DataBadge type="synthetic"/>
              </div>
              <select value={hhSize}
                onChange={e => { setHhSize(e.target.value); resetResults(); }}
                style={S.select}>
                <option value="">Select…</option>
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n === 6 ? "6 or more" : n}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Manx language toggle — shown when QI active and IoM selected */}
        {activeQIs.includes("manx_language") && island === "iom" && (
          <div style={{
            background:"#0f172a", borderRadius:8, padding:"12px 14px",
            marginBottom:12, border:"1px solid #334155",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ ...S.label, marginBottom:2, display:"flex", gap:6, alignItems:"center" }}>
                Manx Speaker <DataBadge type="published_exact"/>
              </div>
              {manxContext && area && (
                <div style={{ color:"#64748b", fontSize:11 }}>
                  {area}: {manxContext.total_any_manx} speakers of {manxContext.area_pop.toLocaleString()} residents
                  ({((manxContext.total_any_manx/manxContext.area_pop)*100).toFixed(1)}%)
                </div>
              )}
            </div>
            <button
              onClick={() => { setManxSpeaker(v => !v); resetResults(); }}
              style={{
                padding:"6px 14px", borderRadius:20, border:"1px solid",
                borderColor: manxSpeaker ? "#22c55e" : "#334155",
                background: manxSpeaker ? "#052e16" : "#1e293b",
                color: manxSpeaker ? "#22c55e" : "#64748b",
                fontSize:12, fontWeight:600, cursor:"pointer",
              }}>
              {manxSpeaker ? "✓ Yes" : "Filter on"}
            </button>
          </div>
        )}

        {/* Non-white ethnicity toggle */}
        {activeQIs.includes("ethnicity_nonwhite") && island === "iom" && (
          <div style={{
            background:"#0f172a", borderRadius:8, padding:"12px 14px",
            marginBottom:12, border:"1px solid #334155",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ ...S.label, marginBottom:2, display:"flex", gap:6, alignItems:"center" }}>
                Non-White Ethnicity <DataBadge type="modelled_estimate"/>
              </div>
              {ethContext && area && (
                <div style={{ color:"#64748b", fontSize:11 }}>
                  {area}: ~{ethContext.non_white_estimate} estimated non-white residents
                  ({((ethContext.non_white_estimate/ethContext.area_pop)*100).toFixed(1)}%)
                </div>
              )}
              <div style={{ color:"#92400e", fontSize:10, marginTop:3 }}>
                ⚠ Area-level estimate — proportional distribution from island total. Rural figures likely overstated.
              </div>
            </div>
            <button
              onClick={() => { setNonWhiteEthnicity(v => !v); resetResults(); }}
              style={{
                padding:"6px 14px", borderRadius:20, border:"1px solid", marginLeft:12,
                borderColor: nonWhiteEthnicity ? "#f59e0b" : "#334155",
                background: nonWhiteEthnicity ? "#1c1003" : "#1e293b",
                color: nonWhiteEthnicity ? "#f59e0b" : "#64748b",
                fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0,
              }}>
              {nonWhiteEthnicity ? "✓ Yes" : "Filter on"}
            </button>
          </div>
        )}

        <button
          onClick={runSimulation}
          disabled={!canRun || running}
          style={{
            padding:"10px 24px", border:"none", borderRadius:6,
            background: (!canRun || running) ? "#1e3a5f" : "#7c3aed",
            color:"#fff", fontSize:13, fontWeight:600,
            cursor: (!canRun || running) ? "not-allowed" : "pointer",
          }}>
          {running ? "Running simulation…" : "Run Attack Simulation"}
        </button>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1 && !running;
            const color  = stepColor(s.count, isLast);
            return (
              <div key={i} style={{
                background:"#1e293b", borderRadius:8, padding:16,
                borderLeft:`3px solid ${color}`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>
                        Step {i+1} — {s.label}
                      </span>
                      <DataBadge type={s.dataType}/>
                    </div>
                    <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{s.desc}</div>
                    {s.contextNote && (
                      <div style={{ color:"#475569", fontSize:11, marginTop:2, fontStyle:"italic" }}>
                        {s.contextNote}
                      </div>
                    )}
                    <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>
                      <strong style={{ color:"#334155" }}>Source:</strong>{" "}
                      {s.source}
                      {s.citation && (
                        <span style={{ color:"#3b82f6" }}> — {s.citation}</span>
                      )}
                    </div>
                    {s.caveat && (
                      <div style={{
                        color:"#92400e", fontSize:10, marginTop:4,
                        background:"#1c1003", padding:"4px 8px", borderRadius:4,
                        border:"1px solid #92400e44",
                      }}>
                        ⚠ {s.caveat}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                    <div style={{ color, fontWeight:800, fontSize:28 }}>
                      {s.count.toLocaleString()}
                    </div>
                    <div style={{ color:"#64748b", fontSize:11 }}>
                      {s.count === 1 ? "person" : "candidates"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Verdict */}
          {hasRun && finalCount !== null && (
            <div style={{
              borderRadius:8, padding:16,
              background: finalCount <= 1 ? "#450a0a" : finalCount <= 5 ? "#431407" : "#1c1003",
              border:`2px solid ${finalCount <= 1 ? "#ef4444" : finalCount <= 5 ? "#f97316" : "#eab308"}`,
            }}>
              <div style={{
                color: finalCount <= 1 ? "#ef4444" : finalCount <= 5 ? "#f97316" : "#eab308",
                fontWeight:800, fontSize:15, marginBottom:8,
              }}>
                {finalCount <= 1
                  ? "⚠ Single individual identified"
                  : finalCount <= 5
                  ? `⚠ ${finalCount} candidates — near-unique`
                  : `${finalCount} candidates remain`}
              </div>
              <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
                {finalCount <= 1
                  ? "This individual is effectively re-identified using only the selected data sources. No breach occurred."
                  : finalCount <= 5
                  ? `With ${finalCount} candidates, one additional data point would likely isolate a single individual.`
                  : `With ${finalCount} candidates, add further quasi-identifiers to reduce the set.`}
              </div>
              <div style={{
                marginTop:10, fontSize:11, padding:"6px 10px", borderRadius:4,
                color: dataMode === "published" ? "#22c55e" : "#a78bfa",
                background: dataMode === "published" ? "#052e16" : "#1e1040",
                border: `1px solid ${dataMode === "published" ? "#22c55e44" : "#a78bfa44"}`,
              }}>
                {dataMode === "published"
                  ? "✓ Published census data only. All counts directly citable."
                  : "~ Steps marked Synthetic model use population model counts, not published exact figures."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
