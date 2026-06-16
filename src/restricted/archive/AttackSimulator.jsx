import { useState, useMemo } from "react";
import {
  ISLANDS, AGE_BANDS, OCCUPATIONS, QI_DEFINITIONS,
  IOM_CENSUS_CELLS, IOM_MANX_LANGUAGE, IOM_ETHNICITY,
} from "../data/constants";
import attackLookup from "../data/attackLookup.json";

// -- Jersey sensitive data (2021 census published figures) ---------------------
const JSY_SENSITIVE = {
  sexual_orientation: {
    options: [
      { value: "heterosexual", label: "Heterosexual / straight", p: 0.935 },
      { value: "gay_lesbian",  label: "Gay or lesbian",          p: 0.018 },
      { value: "bisexual",     label: "Bisexual",                p: 0.011 },
      { value: "other",        label: "Other sexual orientation", p: 0.004 },
      { value: "not_stated",   label: "Not stated",              p: 0.032 },
    ],
    source: "Jersey 2021 Census, Table P09 -- Sexual Orientation",
    note: "Jersey is the only Crown Dependency to collect sexual orientation data in the census.",
  },
  health_condition: {
    options: [
      { value: "none",          label: "No longstanding condition",        p: 0.790 },
      { value: "not_limiting",  label: "Yes -- not limiting daily life",   p: 0.053 },
      { value: "limits_little", label: "Yes -- limits daily life a little",p: 0.105 },
      { value: "limits_lot",    label: "Yes -- limits daily life a lot",   p: 0.052 },
    ],
    source: "Jersey 2021 Census, Table P11 -- Long-term Health Conditions",
    note: "Around 1 in 5 Jersey residents (21%) reported a longstanding condition.",
  },
};

// Jersey vingtaines for simulator
const JSY_VINGTAINES_SIM = [
  {name:"St Helier - Rouge Bouillon",    pop:4200, parish:"St Helier"},
  {name:"St Helier - Georgetown",        pop:3800, parish:"St Helier"},
  {name:"St Helier - Bas du Mont Cochon",pop:3600, parish:"St Helier"},
  {name:"St Helier - Cheapside",         pop:3500, parish:"St Helier"},
  {name:"St Helier - Colomberie",        pop:3400, parish:"St Helier"},
  {name:"St Helier - Mont a l Abbe",     pop:3300, parish:"St Helier"},
  {name:"St Helier - Ville es Nouaux",   pop:3200, parish:"St Helier"},
  {name:"St Helier - Almorah",           pop:3100, parish:"St Helier"},
  {name:"St Helier - Charing Cross",     pop:2900, parish:"St Helier"},
  {name:"St Helier - Duhamel",           pop:2800, parish:"St Helier"},
  {name:"St Saviour - Longueville",      pop:2600, parish:"St Saviour"},
  {name:"St Saviour - Anneville",        pop:2500, parish:"St Saviour"},
  {name:"St Saviour - Bagatelle",        pop:2400, parish:"St Saviour"},
  {name:"St Saviour - Bagot",            pop:2300, parish:"St Saviour"},
  {name:"St Saviour - Clos de Roncier",  pop:2200, parish:"St Saviour"},
  {name:"St Brelade - Les Quennevais",   pop:5800, parish:"St Brelade"},
  {name:"St Brelade - St Aubin",         pop:3200, parish:"St Brelade"},
  {name:"St Brelade - Quaisne",          pop:2012, parish:"St Brelade"},
];

// -- Styles --------------------------------------------------------------------
const S = {
  select: {
    width:"100%", background:"#0f172a", border:"1px solid #334155",
    borderRadius:6, padding:"8px 10px", color:"#f1f5f9", fontSize:13,
    fontFamily:"inherit", appearance:"none", WebkitAppearance:"none",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
    paddingRight:28,
  },
  label: { color:"#64748b", fontSize:10, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" },
  card:  { background:"#1e293b", borderRadius:10, padding:20 },
};

// -- Data badge ----------------------------------------------------------------
function DataBadge({ type }) {
  const cfg = {
    published_exact:   { label:"Published exact",   color:"#22c55e", bg:"#052e16" },
    modelled_estimate: { label:"Modelled estimate", color:"#f59e0b", bg:"#1c1003" },
    synthetic:         { label:"Synthetic model",   color:"#a78bfa", bg:"#1e1040" },
  }[type] ?? { label:type, color:"#64748b", bg:"#1e293b" };
  return (
    <span style={{
      background:cfg.bg, color:cfg.color, fontSize:9, fontWeight:700,
      padding:"2px 6px", borderRadius:3, letterSpacing:"0.05em",
      border:`1px solid ${cfg.color}33`,
    }}>{cfg.label}</span>
  );
}

// QIPill removed -- inline render used instead

// -- Count helpers -------------------------------------------------------------
function getCensusCount(island, area, ageBand, sex) {
  if (island !== "iom") return null;
  const areaCells = IOM_CENSUS_CELLS[area];
  if (!areaCells) return null;
  if (!ageBand) return Object.values(areaCells).reduce((s, sexObj) => s + (sexObj.All || 0), 0);
  const ageCells = areaCells[ageBand];
  if (!ageCells) return 0;
  if (!sex) return ageCells.All ?? 0;
  return ageCells[sex] ?? 0;
}

function getAreaTotal(island, area) {
  if (island === "iom") {
    const areaCells = IOM_CENSUS_CELLS[area];
    if (areaCells) {
      return Object.values(areaCells).reduce((s, ageBands) =>
        s + Object.entries(ageBands)
          .filter(([sex]) => sex === "All")
          .reduce((t, [, v]) => t + v, 0), 0);
    }
  }
  return ISLANDS[island]?.areas.find(a => a.name === area)?.population ?? 0;
}

function getSyntheticCount(island, area, ageBand, sex, occupation, hhSize) {
  let rows = attackLookup.filter(r => r.island === island && r.area === area);
  const n1 = rows.reduce((s, r) => s + r.count, 0);
  if (ageBand)    rows = rows.filter(r => r.age_band    === ageBand);
  const n2 = rows.reduce((s, r) => s + r.count, 0);
  if (sex)        rows = rows.filter(r => r.sex         === sex);
  const n3 = rows.reduce((s, r) => s + r.count, 0);
  if (occupation) rows = rows.filter(r => r.occupation  === occupation);
  const n4 = rows.reduce((s, r) => s + r.count, 0);
  if (hhSize)     rows = rows.filter(r => r.hh_size     === Number(hhSize));
  const n5 = rows.reduce((s, r) => s + r.count, 0);
  return { n1, n2, n3, n4, n5 };
}

// -- Step builder --------------------------------------------------------------
function buildSteps({ island, area, ageBand, sex, occupation, hhSize,
                      manxSpeaker, nonWhiteEthnicity,
                      jsySexualOrientation, jsyHealthCondition, jsyVingtaine,
                      activeQIs, dataMode }) {

  const areaPop    = ISLANDS[island]?.areas.find(a => a.name === area)?.population ?? 0;
  const hasIomCells = island === "iom" && !!IOM_CENSUS_CELLS[area];
  const areaCount  = hasIomCells ? getAreaTotal(island, area) : areaPop;

  const steps = [];
  let currentPool = areaCount;

  // Step 1 -- Area
  steps.push({
    qi: "area",
    label: "Area / Parish selected",
    desc: `Starting population of ${area}`,
    count: areaCount,
    dataType: hasIomCells ? "published_exact" : "modelled_estimate",
    source: QI_DEFINITIONS.area.source,
    citation: hasIomCells ? QI_DEFINITIONS.area.censusTable : null,
  });

  // Step 2 -- Manx language (IoM only)
  if (activeQIs.includes("manx_language") && manxSpeaker && island === "iom") {
    const langData = IOM_MANX_LANGUAGE[area];
    if (langData) {
      const manxCount = langData.total_any_manx;
      steps.push({
        qi: "manx_language",
        label: "Manx language ability applied",
        desc: "Filter to residents with any Manx language ability",
        count: manxCount,
        dataType: "published_exact",
        source: QI_DEFINITIONS.manx_language.source,
        citation: QI_DEFINITIONS.manx_language.censusTable,
        contextNote: `${manxCount} of ${areaPop.toLocaleString()} residents (${((manxCount/areaPop)*100).toFixed(1)}%) have any Manx ability`,
      });
      currentPool = manxCount;
    }
  }

  // Step 3 -- Non-white ethnicity (IoM only)
  if (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity && island === "iom") {
    const ethData = IOM_ETHNICITY[area];
    if (ethData) {
      const ethCount = ethData.non_white_estimate;
      steps.push({
        qi: "ethnicity_nonwhite",
        label: "Non-white ethnicity applied",
        desc: "Filter to non-white residents",
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

  // Step 3.5 -- Jersey: vingtaine (applied before other filters if selected)
  if (island === "jersey" && jsyVingtaine) {
    const ving = JSY_VINGTAINES_SIM.find(v => v.name === jsyVingtaine);
    if (ving) {
      steps.push({
        qi: "jsy_vingtaine",
        label: "Vingtaine selected",
        desc: `Filter to ${jsyVingtaine}`,
        count: ving.pop,
        dataType: "modelled_estimate",
        source: "Jersey 2021 Census -- Population by Vingtaine",
        citation: null,
        contextNote: `${jsyVingtaine} (parish: ${ving.parish}) -- estimated population ${ving.pop.toLocaleString()}`,
      });
      currentPool = ving.pop;
    }
  }

  // Step 4 -- Jersey: sexual orientation
  if (activeQIs.includes("jsy_sexual_orientation") && jsySexualOrientation && island === "jersey") {
    const opt = JSY_SENSITIVE.sexual_orientation.options.find(o => o.value === jsySexualOrientation);
    if (opt) {
      const count = Math.round(currentPool * opt.p);
      steps.push({
        qi: "jsy_sexual_orientation",
        label: "Sexual orientation applied",
        desc: `Filter to: ${opt.label}`,
        count: Math.max(1, count),
        dataType: "published_exact",
        source: JSY_SENSITIVE.sexual_orientation.source,
        citation: null,
        contextNote: `~${Math.max(1,count)} of ${currentPool.toLocaleString()} residents (${(opt.p*100).toFixed(1)}%) -- ${opt.label}`,
      });
      currentPool = Math.max(1, count);
    }
  }

  // Step 5 -- Jersey: long-term health condition
  if (activeQIs.includes("jsy_health_condition") && jsyHealthCondition && island === "jersey") {
    const opt = JSY_SENSITIVE.health_condition.options.find(o => o.value === jsyHealthCondition);
    if (opt) {
      const count = Math.round(currentPool * opt.p);
      steps.push({
        qi: "jsy_health_condition",
        label: "Long-term health condition applied",
        desc: `Filter to: ${opt.label}`,
        count: Math.max(1, count),
        dataType: "published_exact",
        source: JSY_SENSITIVE.health_condition.source,
        citation: null,
        contextNote: `~${Math.max(1,count)} of ${currentPool.toLocaleString()} residents (${(opt.p*100).toFixed(1)}%) -- ${opt.label}`,
      });
      currentPool = Math.max(1, count);
    }
  }

  // Step 6 -- Age band
  if (activeQIs.includes("age") && ageBand) {
    let count, dataType;
    const hasSpecialFilter = (activeQIs.includes("manx_language") && manxSpeaker)
                          || (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity)
                          || (activeQIs.includes("jsy_sexual_orientation") && !!jsySexualOrientation)
                          || (activeQIs.includes("jsy_health_condition") && !!jsyHealthCondition);

    if (hasSpecialFilter) {
      const islandTotal = island === "iom"
        ? Object.values(IOM_CENSUS_CELLS).reduce((s, a) => s + (a[ageBand]?.All ?? 0), 0)
        : ISLANDS[island].population * (ISLANDS[island].age?.[ageBand] ?? 0.1);
      count = Math.round(currentPool * (islandTotal / ISLANDS[island].population));
      dataType = "modelled_estimate";
    } else if (hasIomCells) {
      count = getCensusCount(island, area, ageBand, null);
      dataType = "published_exact";
    } else {
      const s = getSyntheticCount(island, area, ageBand, null, null, null);
      count = s.n2;
      dataType = "modelled_estimate";
    }
    steps.push({
      qi: "age", label: "Age band applied", desc: `Filter to ${ageBand} age group`,
      count: Math.max(0, count), dataType,
      source: QI_DEFINITIONS.age.source,
      citation: dataType === "published_exact" ? QI_DEFINITIONS.age.censusTable : null,
    });
    currentPool = Math.max(0, count);
  }

  // Step 7 -- Sex
  if (activeQIs.includes("sex") && sex) {
    let count, dataType;
    const hasSpecialFilter = (activeQIs.includes("manx_language") && manxSpeaker)
                          || (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity)
                          || (activeQIs.includes("jsy_sexual_orientation") && !!jsySexualOrientation)
                          || (activeQIs.includes("jsy_health_condition") && !!jsyHealthCondition);

    if (hasSpecialFilter) {
      count = Math.round(currentPool * 0.5);
      dataType = "modelled_estimate";
    } else if (hasIomCells && ageBand) {
      count = getCensusCount(island, area, ageBand, sex);
      dataType = "published_exact";
    } else if (hasIomCells && !ageBand) {
      const areaCells = IOM_CENSUS_CELLS[area];
      count = Object.values(areaCells).reduce((s, bands) => s + (bands[sex] ?? 0), 0);
      dataType = "published_exact";
    } else {
      const s = getSyntheticCount(island, area, ageBand, sex, null, null);
      count = s.n3;
      dataType = "modelled_estimate";
    }
    steps.push({
      qi: "sex", label: "Sex applied", desc: `Filter to ${sex}`,
      count: Math.max(0, count), dataType,
      source: QI_DEFINITIONS.sex.source,
      citation: dataType === "published_exact" ? QI_DEFINITIONS.sex.censusTable : null,
    });
    currentPool = Math.max(0, count);
  }

  // Detect if sensitive filters have narrowed the pool beyond what the lookup knows about
  const hasSensitiveFilter = (activeQIs.includes("manx_language") && manxSpeaker)
    || (activeQIs.includes("ethnicity_nonwhite") && nonWhiteEthnicity)
    || (activeQIs.includes("jsy_sexual_orientation") && !!jsySexualOrientation)
    || (activeQIs.includes("jsy_health_condition") && !!jsyHealthCondition)
    || !!jsyVingtaine;

  // Step 8 -- Occupation (synthetic)
  if (activeQIs.includes("occupation") && occupation) {
    let count, caveat;
    if (hasSensitiveFilter) {
      // Lookup doesn't know about sensitive filters -- apply occupation proportion to current pool
      const s = getSyntheticCount(island, area, ageBand, sex, occupation, null);
      const basePool = getSyntheticCount(island, area, ageBand, sex, null, null).n3 || 1;
      const occP = s.n4 / basePool;
      count = Math.max(1, Math.round(currentPool * occP));
      caveat = "Occupation proportion applied to sensitive-filter pool. " + QI_DEFINITIONS.occupation.additionalDataNote;
    } else {
      const s = getSyntheticCount(island, area, ageBand, sex, occupation, null);
      count = s.n4;
      caveat = QI_DEFINITIONS.occupation.additionalDataNote;
    }
    steps.push({
      qi: "occupation", label: "Occupation applied", desc: `Filter to ${occupation}`,
      count: count, dataType: "synthetic",
      source: QI_DEFINITIONS.occupation.source, citation: null, caveat,
    });
    currentPool = count;
  }

  // Step 9 -- Household size (synthetic)
  if (activeQIs.includes("hh_size") && hhSize) {
    let count, caveat;
    if (hasSensitiveFilter) {
      // Apply household size proportion to current pool
      const prevOcc = activeQIs.includes("occupation") ? occupation : null;
      const s = getSyntheticCount(island, area, ageBand, sex, prevOcc, hhSize);
      const basePool = getSyntheticCount(island, area, ageBand, sex, prevOcc, null).n4 || 1;
      const hhP = s.n5 / basePool;
      count = Math.max(1, Math.round(currentPool * hhP));
      caveat = "Household size proportion applied to sensitive-filter pool. " + QI_DEFINITIONS.hh_size.additionalDataNote;
    } else {
      const prevOcc = activeQIs.includes("occupation") ? occupation : null;
      const s = getSyntheticCount(island, area, ageBand, sex, prevOcc, hhSize);
      count = s.n5;
      caveat = QI_DEFINITIONS.hh_size.additionalDataNote;
    }
    steps.push({
      qi: "hh_size", label: "Household size applied",
      desc: `Filter to household of ${hhSize}${hhSize === "6" ? " or more" : ""}`,
      count: count, dataType: "synthetic",
      source: QI_DEFINITIONS.hh_size.source, citation: null, caveat,
    });
  }

  return steps;
}

// -- Step colour ---------------------------------------------------------------
function stepColor(count, isLast) {
  if (!isLast) return "#64748b";
  if (count <= 1)  return "#ef4444";
  if (count <= 5)  return "#f97316";
  if (count <= 20) return "#eab308";
  return "#22c55e";
}

// -- Jersey-only QI definitions (not in constants.js) -------------------------
const JSY_QI_DEFS = {
  jsy_sexual_orientation: {
    id: "jsy_sexual_orientation",
    label: "Sexual Orientation",
    jsyOnly: true,
    requiresAdditionalData: false,
    description: "Jersey only -- LGB+ identification from 2021 Jersey census",
  },
  jsy_health_condition: {
    id: "jsy_health_condition",
    label: "Health Condition",
    jsyOnly: true,
    requiresAdditionalData: false,
    description: "Jersey only -- long-term health condition / disability from 2021 Jersey census",
  },
};

// All QI keys and definitions merged -- stable module-level reference
const ALL_QI_KEYS = [...Object.keys(QI_DEFINITIONS), ...Object.keys(JSY_QI_DEFS)];
const ALL_QI_DEFS = { ...QI_DEFINITIONS, ...JSY_QI_DEFS };

// -- Main component ------------------------------------------------------------
export function AttackSimulator() {
  const [island,              setIsland]              = useState("iom");
  const [area,                setArea]                = useState("");
  const [ageBand,             setAgeBand]             = useState("");
  const [sex,                 setSex]                 = useState("");
  const [occupation,          setOccupation]          = useState("");
  const [hhSize,              setHhSize]              = useState("");
  const [manxSpeaker,         setManxSpeaker]         = useState(false);
  const [nonWhiteEthnicity,   setNonWhiteEthnicity]   = useState(false);
  const [jsySexualOrientation,setJsySexualOrientation]= useState("");
  const [jsyHealthCondition,  setJsyHealthCondition]  = useState("");
  const [jsyVingtaine,        setJsyVingtaine]        = useState("");

  const [dataMode,  setDataMode]  = useState("published");
  const [activeQIs, setActiveQIs] = useState(["area", "age", "sex"]);
  const [steps,     setSteps]     = useState([]);
  const [running,   setRunning]   = useState(false);
  const [hasRun,    setHasRun]    = useState(false);

  const islandData    = ISLANDS[island];
  const useAdditional = dataMode === "additional";

  // Compute directly on every render -- no memo, no stale closure issues
  const availableQIs = ALL_QI_KEYS.filter(qi => {
    const def = ALL_QI_DEFS[qi];
    if (!def) return false;
    if (def.iomOnly && island !== "iom") return false;
    if (def.jsyOnly && island !== "jersey") return false;
    if (def.requiresAdditionalData && !useAdditional) return false;
    return true;
  });

  const handleDataModeChange = (mode) => {
    setDataMode(mode);
    if (mode === "published") {
      setActiveQIs(prev => prev.filter(qi => !QI_DEFINITIONS[qi]?.requiresAdditionalData));
      setOccupation(""); setHhSize("");
    }
    setSteps([]); setHasRun(false);
  };

  const handleIslandChange = (newIsland) => {
    setIsland(newIsland); setArea("");
    setActiveQIs(prev => prev.filter(qi => {
      const def = QI_DEFINITIONS[qi];
      if (def?.iomOnly && newIsland !== "iom") return false;
      if (def?.jsyOnly && newIsland !== "jersey") return false;
      return true;
    }));
    setManxSpeaker(false); setNonWhiteEthnicity(false);
    setJsySexualOrientation(""); setJsyHealthCondition(""); setJsyVingtaine("");
    setSteps([]); setHasRun(false);
  };

  const toggleQI = (qi) => {
    const isAdding = !activeQIs.includes(qi);
    setActiveQIs(prev => isAdding ? [...prev, qi] : prev.filter(q => q !== qi));
    // Auto-enable toggle when pill is activated; disable when removed
    if (qi === "manx_language")          setManxSpeaker(isAdding);
    if (qi === "ethnicity_nonwhite")     setNonWhiteEthnicity(isAdding);
    if (qi === "jsy_sexual_orientation") setJsySexualOrientation("");
    if (qi === "jsy_health_condition")   setJsyHealthCondition("");
    setSteps([]); setHasRun(false);
  };

  const resetResults = () => { setSteps([]); setHasRun(false); };
  const canRun = area && activeQIs.length > 1;

  const runSimulation = async () => {
    if (!canRun || running) return;
    setRunning(true); setSteps([]); setHasRun(false);
    const built = buildSteps({
      island, area, ageBand, sex, occupation, hhSize,
      manxSpeaker, nonWhiteEthnicity,
      jsySexualOrientation, jsyHealthCondition, jsyVingtaine,
      activeQIs, dataMode,
    });
    for (let i = 0; i < built.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setSteps(prev => [...prev, built[i]]);
    }
    setRunning(false); setHasRun(true);
  };

  const finalCount = steps.length > 0 ? steps[steps.length - 1].count : null;
  const manxContext = area && island === "iom" ? IOM_MANX_LANGUAGE[area]  : null;
  const ethContext  = area && island === "iom" ? IOM_ETHNICITY[area]       : null;

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

      {/* Data mode */}
      <div style={{ background:"#1e293b", borderRadius:10, padding:16 }}>
        <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:10,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>Data Source</div>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[
            { id:"published",   label:"Published Census Only",
              desc:"Exact cell counts from published government tables. Every number directly citable." },
            { id:"additional",  label:"+ Additional Data",
              desc:"Supplements with synthetic population model. Enables occupation and household size. Synthetic counts clearly labelled." },
          ].map(opt => (
            <button key={opt.id} onClick={() => handleDataModeChange(opt.id)} style={{
              flex:1, padding:"10px 14px", borderRadius:8, border:"1px solid",
              borderColor: dataMode === opt.id ? "#60a5fa" : "#334155",
              background:  dataMode === opt.id ? "#0f2340" : "#0f172a",
              color:       dataMode === opt.id ? "#e2e8f0" : "#64748b",
              cursor:"pointer", textAlign:"left",
            }}>
              <div style={{ fontWeight:600, fontSize:12, marginBottom:3 }}>{opt.label}</div>
              <div style={{ fontSize:10, lineHeight:1.5,
                color: dataMode === opt.id ? "#94a3b8" : "#475569" }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {/* QI pills */}
        <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:8,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>Quasi-Identifiers</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
          {ALL_QI_KEYS.map(qi => {
            const def = ALL_QI_DEFS[qi];
            const isActive = activeQIs.includes(qi);
            const isIomOnly = !!def.iomOnly;
            const isJsyOnly = !!def.jsyOnly;
            // Use availableQIs as the single source of truth for lock state
            const locked = !isActive && !availableQIs.includes(qi);

            const islandTag = isIomOnly
              ? { label:"IoM only",    color:"#3b82f6", bg:"rgba(59,130,246,0.12)" }
              : isJsyOnly
              ? { label:"Jersey only", color:"#f59e0b", bg:"rgba(245,158,11,0.12)" }
              : null;

            const activeColor  = isJsyOnly ? "#f59e0b" : isIomOnly ? "#3b82f6" : "#60a5fa";
            const activeBg     = isJsyOnly ? "#1c0f00" : isIomOnly ? "#0f1f3d" : "#1d4ed8";
            const unlockedBorder = isJsyOnly ? "#78350f" : isIomOnly ? "#1e3a5f" : "#334155";

            return (
              <button key={qi} onClick={() => !locked && toggleQI(qi)}
                title={locked
                  ? (isIomOnly ? "Isle of Man only" : isJsyOnly ? "Jersey only" : "Requires Additional Data mode")
                  : (def.description || def.label)}
                style={{
                  padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:600,
                  border:`1px solid ${isActive ? activeColor : locked ? "#1e293b" : unlockedBorder}`,
                  background: isActive ? activeBg : locked ? "#0a0f1a" : "#1e293b",
                  color: isActive ? "#fff" : locked ? "#1e293b" : "#94a3b8",
                  cursor: locked ? "not-allowed" : "pointer", transition:"all 0.15s",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                {def.label}
                {locked && <span style={{ fontSize:9, color:"#334155" }}>locked</span>}
                {!locked && def.requiresAdditionalData && (
                  <span style={{ fontSize:9, color: isActive ? "#93c5fd" : "#64748b" }}>~</span>
                )}
                {islandTag && (
                  <span style={{ fontSize:9, fontWeight:700,
                    color: locked ? "#334155" : islandTag.color,
                    background: locked ? "transparent" : islandTag.bg,
                    padding:"1px 4px", borderRadius:3 }}>
                    {islandTag.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ color:"#475569", fontSize:10 }}>
          ~ synthetic model &nbsp;.&nbsp; ? requires Additional Data or island-specific &nbsp;.&nbsp;
          <span style={{ color:"#f59e0b" }}>JSY</span> Jersey only -- sensitive census data
        </div>
      </div>

      {/* Inputs */}
      <div style={S.card}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>

          <div>
            <div style={S.label}>Island</div>
            <select value={island} onChange={e => handleIslandChange(e.target.value)} style={S.select}>
              {Object.keys(ISLANDS).map(k => (
                <option key={k} value={k}>{ISLANDS[k].name}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={S.label}>Area / Parish</div>
            <select value={area} onChange={e => { setArea(e.target.value); setJsyVingtaine(""); resetResults(); }} style={S.select}>
              <option value="">Select area...</option>
              {[...islandData.areas].sort((a,b) => a.population - b.population).map(a => (
                <option key={a.name} value={a.name}>{a.name} (pop {a.population.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {activeQIs.includes("age") && (
            <div>
              <div style={S.label}>Age Band</div>
              <select value={ageBand} onChange={e => { setAgeBand(e.target.value); resetResults(); }} style={S.select}>
                <option value="">Select...</option>
                {AGE_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          {activeQIs.includes("sex") && (
            <div>
              <div style={S.label}>Sex</div>
              <select value={sex} onChange={e => { setSex(e.target.value); resetResults(); }} style={S.select}>
                <option value="">Select...</option>
                <option>Male</option><option>Female</option>
              </select>
            </div>
          )}

          {activeQIs.includes("occupation") && useAdditional && (
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                Occupation <DataBadge type="synthetic"/>
              </div>
              <select value={occupation} onChange={e => { setOccupation(e.target.value); resetResults(); }} style={S.select}>
                <option value="">Select...</option>
                {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}

          {activeQIs.includes("hh_size") && useAdditional && (
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                Household Size <DataBadge type="synthetic"/>
              </div>
              <select value={hhSize} onChange={e => { setHhSize(e.target.value); resetResults(); }} style={S.select}>
                <option value="">Select...</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 6 ? "6 or more" : n}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Manx language toggle */}
        {activeQIs.includes("manx_language") && island === "iom" && (
          <ToggleFilter
            label="Manx Speaker" badge="published_exact"
            disabled={nonWhiteEthnicity}
            disabledReason="mutually exclusive with ethnicity filter"
            active={manxSpeaker}
            onToggle={() => { setManxSpeaker(v => !v); resetResults(); }}
            context={manxContext && area
              ? `${area}: ${manxContext.total_any_manx} speakers of ${manxContext.area_pop?.toLocaleString()} residents (${((manxContext.total_any_manx/manxContext.area_pop)*100).toFixed(1)}%)`
              : null}
          />
        )}

        {/* Non-white ethnicity toggle */}
        {activeQIs.includes("ethnicity_nonwhite") && island === "iom" && (
          <ToggleFilter
            label="Non-White Ethnicity" badge="modelled_estimate"
            disabled={manxSpeaker}
            disabledReason="mutually exclusive with Manx filter"
            active={nonWhiteEthnicity}
            onToggle={() => { setNonWhiteEthnicity(v => !v); resetResults(); }}
            context={ethContext && area && !manxSpeaker
              ? `${area}: ~${ethContext.non_white_estimate} estimated non-white residents (${((ethContext.non_white_estimate/ethContext.area_pop)*100).toFixed(1)}%)`
              : null}
            warning="Area-level estimate -- proportional distribution from island total. Rural figures likely overstated."
          />
        )}

        {/* Jersey: vingtaine selector -- filtered by selected parish */}
        {island === "jersey" && (
          <div style={{ marginBottom:12 }}>
            <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              Vingtaine
              <span style={{ fontSize:9, fontWeight:700, color:"#f59e0b",
                background:"rgba(245,158,11,0.12)", padding:"1px 5px", borderRadius:3 }}>
                Jersey only
              </span>
              <span style={{ fontSize:10, color:"#475569", fontWeight:400,
                textTransform:"none", letterSpacing:0 }}>optional -- finer than parish</span>
            </div>
            {(() => {
              // Parishes that have vingtaine breakdowns
              const vingtaineParishes = ["St Helier", "St Saviour", "St Brelade"];
              // Filter by selected area if it has vingtaines, otherwise show all
              const filtered = area && vingtaineParishes.includes(area)
                ? JSY_VINGTAINES_SIM.filter(v => v.parish === area)
                : area && !vingtaineParishes.includes(area)
                ? [] // selected parish has no vingtaines
                : JSY_VINGTAINES_SIM; // no parish selected -- show all
              return (
                <select value={jsyVingtaine}
                  onChange={e => { setJsyVingtaine(e.target.value); resetResults(); }}
                  style={S.select}>
                  <option value="">-- skip (use parish level) --</option>
                  {filtered.length === 0 && area && (
                    <option value="" disabled>No vingtaine breakdown for {area}</option>
                  )}
                  {filtered.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} (pop ~{v.pop.toLocaleString()})
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>
        )}

        {/* Jersey: sexual orientation */}
        {activeQIs.includes("jsy_sexual_orientation") && island === "jersey" && (
          <div style={{ background:"#0f172a", borderRadius:8, padding:"12px 14px",
            marginBottom:12, border:"1px solid #334155" }}>
            <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6,
              marginBottom:6 }}>
              Sexual Orientation
              <DataBadge type="published_exact"/>
            </div>
            <select value={jsySexualOrientation}
              onChange={e => { setJsySexualOrientation(e.target.value); resetResults(); }}
              style={S.select}>
              <option value="">-- skip this field --</option>
              {JSY_SENSITIVE.sexual_orientation.options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label} (~{(o.p*100).toFixed(1)}%)
                </option>
              ))}
            </select>
            <div style={{ color:"#7c3aed", fontSize:10, marginTop:6 }}>
              Sensitive attribute. Jersey is the only Crown Dependency to collect this data.
              Its presence creates significant re-identification risk.
            </div>
          </div>
        )}

        {/* Jersey: health condition */}
        {activeQIs.includes("jsy_health_condition") && island === "jersey" && (
          <div style={{ background:"#0f172a", borderRadius:8, padding:"12px 14px",
            marginBottom:12, border:"1px solid #334155" }}>
            <div style={{ ...S.label, display:"flex", alignItems:"center", gap:6,
              marginBottom:6 }}>
              Long-term Health Condition
              <DataBadge type="published_exact"/>
            </div>
            <select value={jsyHealthCondition}
              onChange={e => { setJsyHealthCondition(e.target.value); resetResults(); }}
              style={S.select}>
              <option value="">-- skip this field --</option>
              {JSY_SENSITIVE.health_condition.options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label} (~{(o.p*100).toFixed(1)}%)
                </option>
              ))}
            </select>
            <div style={{ color:"#64748b", fontSize:10, marginTop:6 }}>
              {JSY_SENSITIVE.health_condition.note}
            </div>
          </div>
        )}

        <button onClick={runSimulation} disabled={!canRun || running} style={{
          padding:"10px 24px", border:"none", borderRadius:6,
          background: (!canRun || running) ? "#1e3a5f" : "#7c3aed",
          color:"#fff", fontSize:13, fontWeight:600,
          cursor: (!canRun || running) ? "not-allowed" : "pointer",
        }}>
          {running ? "Running simulation..." : "Run Attack Simulation"}
        </button>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1 && !running;
            const color  = stepColor(s.count, isLast);
            return (
              <div key={i} style={{ background:"#1e293b", borderRadius:8, padding:16, borderLeft:`3px solid ${color}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>
                        Step {i+1} -- {s.label}
                      </span>
                      <DataBadge type={s.dataType}/>
                    </div>
                    <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{s.desc}</div>
                    {s.contextNote && (
                      <div style={{ color:"#475569", fontSize:11, marginTop:2, fontStyle:"italic" }}>{s.contextNote}</div>
                    )}
                    <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>
                      <strong style={{ color:"#334155" }}>Source:</strong>{" "}{s.source}
                      {s.citation && <span style={{ color:"#3b82f6" }}> -- {s.citation}</span>}
                    </div>
                    {s.caveat && (
                      <div style={{ color:"#92400e", fontSize:10, marginTop:4, background:"#1c1003",
                        padding:"4px 8px", borderRadius:4, border:"1px solid #92400e44" }}>
                        ! {s.caveat}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                    <div style={{ color, fontWeight:800, fontSize:28 }}>{s.count.toLocaleString()}</div>
                    <div style={{ color:"#64748b", fontSize:11 }}>{s.count === 1 ? "person" : "candidates"}</div>
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
                {finalCount <= 1 ? "! Single individual identified"
                  : finalCount <= 5 ? `! ${finalCount} candidates -- near-unique`
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
                border:`1px solid ${dataMode === "published" ? "#22c55e44" : "#a78bfa44"}`,
              }}>
                {dataMode === "published"
                  ? "v Published census data only. All counts directly citable."
                  : "~ Steps marked Synthetic model use population model counts, not published exact figures."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -- Reusable toggle filter row ------------------------------------------------
function ToggleFilter({ label, badge, disabled, disabledReason, active, onToggle, context, warning, warningColor }) {
  return (
    <div style={{
      background:"#0f172a", borderRadius:8, padding:"12px 14px", marginBottom:12,
      border:`1px solid ${disabled ? "#1e293b" : "#334155"}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      opacity: disabled ? 0.4 : 1,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ ...S.label, marginBottom:2, display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {label} <DataBadge type={badge}/>
          {disabled && disabledReason && (
            <span style={{ color:"#475569", fontSize:9 }}>-- {disabledReason}</span>
          )}
        </div>
        {context && !disabled && (
          <div style={{ color:"#64748b", fontSize:11 }}>{context}</div>
        )}
        {warning && !disabled && (
          <div style={{ color: warningColor || "#92400e", fontSize:10, marginTop:3 }}>
            ! {warning}
          </div>
        )}
      </div>
      <button
        disabled={!!disabled}
        onClick={onToggle}
        style={{
          padding:"6px 14px", borderRadius:20, border:"1px solid", marginLeft:12, flexShrink:0,
          borderColor: active ? "#22c55e" : "#334155",
          background:  active ? "#052e16" : "#1e293b",
          color:       active ? "#22c55e" : "#64748b",
          fontSize:12, fontWeight:600,
          cursor: disabled ? "not-allowed" : "pointer",
        }}>
        {active ? "Yes" : "Filter on"}
      </button>
    </div>
  );
}

