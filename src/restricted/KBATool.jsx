import { useState, useMemo } from "react";
import { IOM_SCHOOLS } from "../data/iomSchools";

const { schools, collision_groups } = IOM_SCHOOLS;

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  card:   { background: "#1e293b", borderRadius: 10, padding: 20 },
  label:  { color: "#64748b", fontSize: 10, marginBottom: 4, textTransform: "uppercase" },
  select: {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 6, padding: "8px 10px", color: "#f1f5f9", fontSize: 13,
  },
};

function Badge({ color, bg, children }) {
  return (
    <span style={{
      background: bg, color, fontSize: 9, fontWeight: 700,
      padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em",
      border: `1px solid ${color}33`, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

// ── Clean name for KBA (strip spaces, uppercase) ──────────────────────────────
function cleanName(name) {
  return name.toUpperCase().replace(/\s/g, "");
}

function letterAt(name, pos) {
  const c = cleanName(name);
  return pos >= 1 && pos <= c.length ? c[pos - 1] : null;
}

// ── Panel 1: School inspector ─────────────────────────────────────────────────
function SchoolInspector() {
  const [pos1, setPos1] = useState(1);
  const [pos2, setPos2] = useState(3);

  const posKey = `pos${pos1}+pos${pos2}`;

  // For each school, what's their response to this challenge?
  const responses = useMemo(() => {
    const map = {};
    for (const s of schools) {
      const c = cleanName(s.name);
      if (pos1 <= c.length && pos2 <= c.length) {
        const resp = c[pos1 - 1] + c[pos2 - 1];
        if (!map[resp]) map[resp] = [];
        map[resp].push(s);
      }
    }
    return map;
  }, [pos1, pos2]);

  const collisions = Object.entries(responses)
    .filter(([, ss]) => ss.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  const uniqueSchools = Object.entries(responses)
    .filter(([, ss]) => ss.length === 1)
    .length;

  const maxLen = Math.max(...schools.map(s => cleanName(s.name).length));

  return (
    <div style={S.card}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        Challenge Collision Matrix
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        Select two letter positions. Schools with identical responses are indistinguishable
        to an attacker — and to the authentication system.
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end" }}>
        <div>
          <div style={S.label}>First position</div>
          <select value={pos1} onChange={e => {
            const v = Number(e.target.value);
            setPos1(v);
            if (v >= pos2) setPos2(v + 1);
          }} style={{ ...S.select, width: 80 }}>
            {Array.from({ length: maxLen - 1 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={S.label}>Second position</div>
          <select value={pos2} onChange={e => setPos2(Number(e.target.value))}
            style={{ ...S.select, width: 80 }}>
            {Array.from({ length: maxLen - pos1 }, (_, i) => i + pos1 + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div style={{ paddingBottom: 2 }}>
          <div style={{ color: "#64748b", fontSize: 11 }}>
            {collisions.length > 0
              ? <span style={{ color: "#ef4444" }}>⚠ {collisions.length} collision group{collisions.length > 1 ? "s" : ""}</span>
              : <span style={{ color: "#22c55e" }}>✓ No collisions</span>
            }
            &nbsp;·&nbsp;
            <span style={{ color: "#64748b" }}>{uniqueSchools} unique</span>
          </div>
        </div>
      </div>

      {/* Show all schools with their response, grouped by collision */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(responses)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([resp, ss]) => {
            const isCollision = ss.length > 1;
            return (
              <div key={resp} style={{
                background: "#0f172a", borderRadius: 8, padding: "10px 14px",
                border: `1px solid ${isCollision ? "#ef444444" : "#1e293b"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isCollision ? 8 : 0 }}>
                  <div style={{
                    fontFamily: "monospace", fontSize: 18, fontWeight: 800,
                    color: isCollision ? "#ef4444" : "#22c55e",
                    background: isCollision ? "#450a0a" : "#052e16",
                    padding: "4px 10px", borderRadius: 6, letterSpacing: "0.1em",
                    minWidth: 48, textAlign: "center",
                  }}>
                    {resp}
                  </div>
                  {isCollision && (
                    <Badge color="#ef4444" bg="#450a0a">
                      COLLISION — {ss.length} schools indistinguishable
                    </Badge>
                  )}
                </div>
                {isCollision && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: 58 }}>
                    {ss.map(s => <SchoolNameDisplay key={s.name} school={s} pos1={pos1} pos2={pos2} />)}
                  </div>
                )}
                {!isCollision && (
                  <div style={{ marginLeft: 58 }}>
                    <SchoolNameDisplay school={ss[0]} pos1={pos1} pos2={pos2} />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function SchoolNameDisplay({ school, pos1, pos2 }) {
  const clean = cleanName(school.name);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
        {clean.split("").map((ch, i) => {
          const isHighlighted = i + 1 === pos1 || i + 1 === pos2;
          return (
            <span key={i} style={{
              color: isHighlighted ? "#f59e0b" : "#475569",
              fontWeight: isHighlighted ? 800 : 400,
              borderBottom: isHighlighted ? "2px solid #f59e0b" : "none",
            }}>
              {ch}
            </span>
          );
        })}
      </span>
      <span style={{ color: "#475569", fontSize: 10 }}>{school.area}</span>
    </div>
  );
}

// ── Panel 2: Brute force calculator ──────────────────────────────────────────
function BruteForcePanel() {
  const [selectedSchool, setSelectedSchool] = useState(schools[0].name);

  const school = schools.find(s => s.name === selectedSchool);
  const clean  = cleanName(school.name);
  const n      = clean.length;
  const totalChallenges = (n * (n - 1)) / 2; // C(n,2)

  // All possible challenges for this school
  const allChallenges = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      allChallenges.push({
        pos1: i, pos2: j,
        response: clean[i - 1] + clean[j - 1],
      });
    }
  }

  // Unique responses — fewer unique responses = harder to distinguish from other schools
  const uniqueResponses = new Set(allChallenges.map(c => `${c.pos1}+${c.pos2}:${c.response}`)).size;

  // How many other schools share at least one challenge response?
  const vulnerableCount = schools.filter(s => {
    if (s.name === school.name) return false;
    const otherClean = cleanName(s.name);
    return allChallenges.some(c => {
      const otherResp = c.pos1 <= otherClean.length && c.pos2 <= otherClean.length
        ? otherClean[c.pos1 - 1] + otherClean[c.pos2 - 1]
        : null;
      return otherResp === c.response;
    });
  }).length;

  // Attacker scenario: they know someone attended one of N area schools
  // How many guesses worst-case to brute-force the 2-letter challenge?
  const areaSchools = schools.filter(s => s.area === school.area);

  return (
    <div style={S.card}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        Brute Force Calculator
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        Given a school name, how many attempts does it take to enumerate all possible
        2-letter challenge responses? A system without lockout is fully enumerable.
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={S.label}>Select school</div>
        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}
          style={S.select}>
          {[...schools].sort((a, b) => cleanName(a.name).length - cleanName(b.name).length)
            .map(s => (
              <option key={s.name} value={s.name}>
                {s.name} (name length: {cleanName(s.name).length})
              </option>
            ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { k: "Name length",       v: n,               c: n <= 18 ? "#ef4444" : "#94a3b8",
            note: n <= 18 ? "Short — vulnerable" : null },
          { k: "Max 2-pos pairs",   v: totalChallenges, c: "#94a3b8",
            note: "C(n,2) combinations" },
          { k: "Schools that share ≥1 response", v: vulnerableCount, c: vulnerableCount > 0 ? "#f59e0b" : "#22c55e" },
          { k: "Schools in same area", v: areaSchools.length, c: areaSchools.length > 1 ? "#f97316" : "#22c55e" },
        ].map(r => (
          <div key={r.k} style={{ background: "#0f172a", borderRadius: 8, padding: 12 }}>
            <div style={{ color: "#475569", fontSize: 9, textTransform: "uppercase", marginBottom: 4 }}>
              {r.k}
            </div>
            <div style={{ color: r.c, fontWeight: 700, fontSize: 22 }}>{r.v}</div>
            {r.note && <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{r.note}</div>}
          </div>
        ))}
      </div>

      {/* The challenge table */}
      <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8,
        textTransform: "uppercase", letterSpacing: "0.05em" }}>
        All possible challenge responses for this school
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b",
        background: "#0f172a", borderRadius: 6, padding: 12,
        maxHeight: 200, overflowY: "auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {allChallenges.map(c => (
            <span key={`${c.pos1}-${c.pos2}`} style={{
              background: "#1e293b", borderRadius: 4, padding: "2px 6px",
              color: "#e2e8f0", fontSize: 10,
            }}>
              <span style={{ color: "#475569" }}>{c.pos1},{c.pos2}:</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}> {c.response}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 14, background: "#431407", borderRadius: 8, padding: 14,
        border: "1px solid #f9731644",
      }}>
        <div style={{ color: "#f97316", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          Attacker scenario
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>
          An attacker who knows the target attended a school in <strong style={{ color: "#e2e8f0" }}>{school.area}</strong> faces{" "}
          <strong style={{ color: "#f97316" }}>{areaSchools.length} candidate school{areaSchools.length !== 1 ? "s" : ""}</strong>.
          The system presents a 2-letter challenge from an unknown position pair.
          The attacker enumerates all {totalChallenges} possible responses for {school.name}.{" "}
          {areaSchools.length > 1 && (
            <>
              Across all candidate schools, they need at most{" "}
              <strong style={{ color: "#f97316" }}>
                {Math.max(...areaSchools.map(s => {
                  const c = cleanName(s.name);
                  return (c.length * (c.length - 1)) / 2;
                }))} attempts
              </strong>{" "}
              to cover every possible challenge. With no account lockout, this is trivially automatable.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Panel 3: Geographic inference ─────────────────────────────────────────────
function GeographicInferencePanel() {
  const [area, setArea] = useState("Douglas");

  const areas = [...new Set(schools.map(s => s.area))].sort();
  const areaSchools = schools.filter(s => s.area === area)
    .sort((a, b) => cleanName(a.name).length - cleanName(b.name).length);

  // For this area, which position pairs produce collisions?
  const areaCollisions = useMemo(() => {
    if (areaSchools.length < 2) return [];
    const maxLen = Math.max(...areaSchools.map(s => cleanName(s.name).length));
    const problematic = [];
    for (let i = 1; i < maxLen; i++) {
      for (let j = i + 1; j <= maxLen; j++) {
        const groups = {};
        for (const s of areaSchools) {
          const c = cleanName(s.name);
          if (i <= c.length && j <= c.length) {
            const resp = c[i - 1] + c[j - 1];
            if (!groups[resp]) groups[resp] = [];
            groups[resp].push(s.name);
          }
        }
        const collisions = Object.values(groups).filter(g => g.length > 1);
        if (collisions.length > 0) {
          problematic.push({ pos1: i, pos2: j, collisions });
        }
      }
    }
    return problematic;
  }, [area]);

  return (
    <div style={S.card}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        Geographic Inference Attack
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        An attacker who knows a target's area of residence can infer likely candidate schools
        from catchment geography. This shows which challenge pairs fail to disambiguate
        schools within the same area.
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={S.label}>Area of residence</div>
        <select value={area} onChange={e => setArea(e.target.value)} style={S.select}>
          {areas.map(a => (
            <option key={a} value={a}>
              {a} ({schools.filter(s => s.area === a).length} school{schools.filter(s => s.area === a).length !== 1 ? "s" : ""})
            </option>
          ))}
        </select>
      </div>

      {/* Schools in this area */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Candidate schools in {area}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {areaSchools.map(s => {
            const clean = cleanName(s.name);
            const n = clean.length;
            const challenges = (n * (n - 1)) / 2;
            return (
              <div key={s.name} style={{
                background: "#0f172a", borderRadius: 6, padding: "10px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>
                    {s.name}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#475569", marginTop: 2 }}>
                    {clean}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>
                    length {n} · {challenges} pairs
                  </div>
                  <div style={{ color: "#64748b", fontSize: 10 }}>
                    ~{(s.roll * 10).toLocaleString()} est. alumni
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collision pairs within this area */}
      {areaSchools.length > 1 && (
        <div>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8,
            textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Challenge pairs that fail to disambiguate
            {areaCollisions.length > 0
              ? <span style={{ color: "#ef4444", marginLeft: 8 }}>
                  {areaCollisions.length} problematic pair{areaCollisions.length !== 1 ? "s" : ""}
                </span>
              : <span style={{ color: "#22c55e", marginLeft: 8 }}>None — schools are distinguishable</span>
            }
          </div>
          {areaCollisions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 250, overflowY: "auto" }}>
              {areaCollisions.map(({ pos1, pos2, collisions }) => (
                <div key={`${pos1}-${pos2}`} style={{
                  background: "#450a0a", borderRadius: 6, padding: "8px 12px",
                  border: "1px solid #ef444433",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    fontFamily: "monospace", fontWeight: 700, color: "#ef4444",
                    fontSize: 13, flexShrink: 0, paddingTop: 1,
                  }}>
                    pos {pos1}+{pos2}
                  </div>
                  <div style={{ fontSize: 11, color: "#fca5a5", lineHeight: 1.6 }}>
                    {collisions.map(g => (
                      <div key={g.join()}>
                        Response <span style={{ fontFamily: "monospace", color: "#f87171" }}>
                          {cleanName(g[0])[pos1 - 1]}{cleanName(g[0])[pos2 - 1]}
                        </span>
                        {" "}shared by: {g.join(", ")}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "#052e16", borderRadius: 6, padding: "10px 14px",
              border: "1px solid #22c55e33", color: "#22c55e", fontSize: 12 }}>
              Every challenge pair uniquely identifies each school in this area.
            </div>
          )}
        </div>
      )}

      {areaSchools.length === 1 && (
        <div style={{ background: "#0f172a", borderRadius: 6, padding: 14,
          border: "1px solid #334155", color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
          Only one school serves this area. Knowing the target's area of residence
          immediately identifies their school — the KBA question is redundant.
          The anonymity set is ~<strong style={{ color: "#e2e8f0" }}>
            {(areaSchools[0].roll * 10).toLocaleString()}
          </strong> estimated living alumni.
        </div>
      )}
    </div>
  );
}

// ── Panel 4: Non-IoM residents ────────────────────────────────────────────────
function NonResidentPanel() {
  // Census: 38.2% born in UK, others from elsewhere
  // ~84,069 residents. Born on IoM: 49.6% (~41,700)
  // Born in UK: 38.2% (~32,100) — attended UK schools
  // Born elsewhere: ~10,200

  const iomBorn   = 41658;
  const ukBorn    = 32153;
  const otherBorn = 84069 - iomBorn - ukBorn;

  // UK has ~16,800 state primary schools
  const ukPrimarySchools = 16800;

  return (
    <div style={S.card}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        The Non-IoM Resident Problem
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
        The KBA system must handle residents who didn't grow up on the Isle of Man.
        This creates a structural asymmetry that weakens security for everyone.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { k: "IoM-born residents", v: iomBorn.toLocaleString(),
            sub: "49.6% of population", c: "#3b82f6",
            note: "KBA meaningful — ~35 schools" },
          { k: "UK-born residents",  v: ukBorn.toLocaleString(),
            sub: "38.2% of population", c: "#f59e0b",
            note: `${ukPrimarySchools.toLocaleString()} possible UK schools` },
          { k: "Other-born residents", v: otherBorn.toLocaleString(),
            sub: "12.2% of population", c: "#10b981",
            note: "Global school universe" },
        ].map(r => (
          <div key={r.k} style={{ background: "#0f172a", borderRadius: 8, padding: 14,
            borderTop: `3px solid ${r.c}` }}>
            <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", marginBottom: 6 }}>{r.k}</div>
            <div style={{ color: r.c, fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{r.v}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>{r.sub}</div>
            <div style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.5, fontStyle: "italic" }}>{r.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          {
            title: "Attacker advantage for IoM-born targets",
            color: "#ef4444", bg: "#450a0a",
            body: `50.4% of the population attended one of ~35 IoM state primary schools. ` +
              `An attacker with geographic knowledge of where a target grew up can typically ` +
              `narrow the candidate set to 1-5 schools, then enumerate all possible 2-letter ` +
              `challenge responses in under 1,500 attempts.`,
          },
          {
            title: "System design leak for UK-born residents",
            color: "#f59e0b", bg: "#1c1003",
            body: `UK residents entered a school name from a universe of ~${ukPrimarySchools.toLocaleString()} possibilities. ` +
              `If the system validates the school name against a UK schools database, ` +
              `a failed validation attempt reveals whether a target is IoM-born or not — ` +
              `an information leak that narrows the attack.`,
          },
          {
            title: "Anonymity set asymmetry",
            color: "#a78bfa", bg: "#1e1040",
            body: `IoM-born: anonymity set of ~${(41658 / 35).toFixed(0)} people per school on average. ` +
              `UK-born: anonymity set of potentially thousands sharing the same large UK school. ` +
              `The KBA provides wildly inconsistent security depending on where you grew up — ` +
              `it is not a uniform second factor.`,
          },
        ].map(item => (
          <div key={item.title} style={{
            background: item.bg, borderRadius: 8, padding: 14,
            border: `1px solid ${item.color}33`,
          }}>
            <div style={{ color: item.color, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
              {item.title}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>{item.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Panel 5: Linguistic fingerprinting ───────────────────────────────────────
function LinguisticFingerprintPanel() {
  // Bunscoill Ghaelgagh: IoM's only Manx-medium primary school
  // Opened 1999 — all alumni are currently aged ~11-35
  // Roll ~35 pupils/year → ~875 total alumni ever enrolled
  // Residents still on island aged 20-35: ~525 estimated
  //
  // Island-wide fluent Manx speakers (speak+read+write): 702
  // Aged 20-35 (~18% of population): ~126 estimated
  //
  // A fluent Manx speaker aged 20-35 almost certainly attended
  // Bunscoill Ghaelgagh or Bunscoill Rhumsaa (Ramsey Manx-medium unit)
  // Their KBA "secret" is effectively determined before the challenge is asked.

  const bgaelgagh = schools.find(s => s.name === "Bunscoill Ghaelgagh");
  const rhumsaa   = schools.find(s => s.name === "Bunscoill Rhumsaa");

  const cleanG = cleanName(bgaelgagh.name); // BUNSCOILLGHAELGAGH
  const cleanR = cleanName(rhumsaa.name);   // BUNSCOILLRHUMSAA

  // Collision pairs between the two Bunscoill schools
  const collisions = [];
  for (let i = 1; i <= Math.min(cleanG.length, cleanR.length); i++) {
    for (let j = i + 1; j <= Math.min(cleanG.length, cleanR.length); j++) {
      const rG = cleanG[i-1] + cleanG[j-1];
      const rR = cleanR[i-1] + cleanR[j-1];
      if (rG === rR) collisions.push({ pos1: i, pos2: j, response: rG });
    }
  }

  const steps = [
    {
      label: "Step 1 — Language as QI",
      color: "#3b82f6",
      body: "Census 2021, Table 2.13: 702 island-wide residents speak, read, and write Manx fluently. " +
            "An attacker observing a target using Manx in daily life, social media, or professional contexts " +
            "can immediately flag them as almost certainly in this cohort.",
      stat: "702", statLabel: "fluent Manx speakers island-wide",
    },
    {
      label: "Step 2 — Age narrows to school generation",
      color: "#f59e0b",
      body: "Bunscoill Ghaelgagh opened in 1999. Its alumni are currently aged 11–35. " +
            "A fluent Manx speaker aged 20–35 almost certainly attended this school or the " +
            "Bunscoill Rhumsaa unit in Ramsey. Estimated cohort aged 20–35: ~126 fluent speakers island-wide.",
      stat: "~126", statLabel: "estimated fluent speakers aged 20–35",
    },
    {
      label: "Step 3 — KBA school is effectively determined",
      color: "#ef4444",
      body: "Before the KBA challenge is even presented, the attacker's candidate school list " +
            "is Bunscoill Ghaelgagh or Bunscoill Rhumsaa — two schools. " +
            "The two-letter challenge must now distinguish between them. " +
            `It fails to do so on ${collisions.length} of the possible position pairs.`,
      stat: collisions.length.toString(),
      statLabel: `of ${Math.min(cleanG.length*(cleanG.length-1)/2, cleanR.length*(cleanR.length-1)/2)} pairs collide`,
    },
    {
      label: "Step 4 — Both candidates confirm the same identity",
      color: "#a78bfa",
      body: "Even when the challenge does distinguish between the two schools, the attacker wins either way: " +
            "both Bunscoill Ghaelgagh and Bunscoill Rhumsaa serve exclusively Manx-medium education. " +
            "Confirming which one the target attended does not protect them — it refines the identification.",
      stat: "2", statLabel: "schools, same demographic fingerprint",
    },
  ];

  return (
    <div style={S.card}>
      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        Linguistic Fingerprinting — Bunscoill Ghaelgagh
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        The IoM's only Manx-medium primary school creates a near-unique KBA vulnerability.
        Manx language ability is a public quasi-identifier that effectively predetermines
        the school name before the challenge is asked. Sources: 2021 Census Table 2.13 (language),
        gov.im school data.
      </div>

      {/* The two schools side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[bgaelgagh, rhumsaa].map(s => {
          const clean = cleanName(s.name);
          const n = clean.length;
          return (
            <div key={s.name} style={{ background: "#0f172a", borderRadius: 8, padding: 14,
              borderTop: "3px solid #a78bfa" }}>
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
                {s.name}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#475569",
                wordBreak: "break-all", marginBottom: 8 }}>
                {clean}
              </div>
              {[
                { k: "Name length",      v: n },
                { k: "Challenge pairs",  v: (n*(n-1)/2) },
                { k: "Est. alumni",      v: `~${(s.roll * 25).toLocaleString()}` },
                { k: "Teaching medium",  v: "Manx Gaelic" },
              ].map(r => (
                <div key={r.k} style={{ display: "flex", justifyContent: "space-between",
                  borderBottom: "1px solid #1e293b", padding: "4px 0", fontSize: 11 }}>
                  <span style={{ color: "#475569" }}>{r.k}</span>
                  <span style={{ color: "#94a3b8", fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Attack chain */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ background: "#0f172a", borderRadius: 8, padding: 14,
            borderLeft: `3px solid ${step.color}`,
            display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, textAlign: "center", minWidth: 52 }}>
              <div style={{ color: step.color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                {step.stat}
              </div>
              <div style={{ color: "#475569", fontSize: 9, lineHeight: 1.3, marginTop: 2 }}>
                {step.statLabel}
              </div>
            </div>
            <div>
              <div style={{ color: step.color, fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                {step.label}
              </div>
              <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collision detail */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Position pairs where Bunscoill Ghaelgagh = Bunscoill Rhumsaa
          <span style={{ color: "#ef4444", marginLeft: 8 }}>
            {collisions.length} collisions
          </span>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 10, background: "#0f172a",
          borderRadius: 6, padding: 12, display: "flex", flexWrap: "wrap", gap: 4,
          maxHeight: 120, overflowY: "auto" }}>
          {collisions.map(c => (
            <span key={`${c.pos1}-${c.pos2}`} style={{
              background: "#450a0a", borderRadius: 3, padding: "2px 6px",
              color: "#fca5a5", fontSize: 10,
            }}>
              {c.pos1},{c.pos2}:<strong>{c.response}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Final finding */}
      <div style={{ background: "#1e1040", borderRadius: 8, padding: 16,
        border: "2px solid #a78bfa44" }}>
        <div style={{ color: "#a78bfa", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
          Finding: Language ability predetermines the KBA answer
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>
          For a fluent Manx speaker aged 20–35, the KBA school question has an effective
          anonymity set of <strong style={{ color: "#e2e8f0" }}>2 schools</strong>, not 35.
          The two-letter challenge fails to distinguish them on{" "}
          <strong style={{ color: "#a78bfa" }}>{collisions.length} position pairs</strong>.
          On the remaining pairs, both answers confirm the same demographic fingerprint.
          The "secret" is not secret — it is inferrable from publicly observable Manx language use,
          cross-referenced with the 2021 Census (Table 2.13) and the known founding date of the school.
        </div>
        <div style={{ marginTop: 10, color: "#64748b", fontSize: 11 }}>
          Sources: IoM 2021 Census Part I Table 2.13 · gov.im school data ·
          Bunscoill Ghaelgagh founded 1999 (Culture Vannin) · All data publicly available.
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function KBATool() {
  const [panel, setPanel] = useState("collision");

  const panels = [
    { id: "collision",    label: "Collision Matrix"       },
    { id: "bruteforce",   label: "Brute Force"            },
    { id: "geo",          label: "Geographic Inference"   },
    { id: "nonresident",  label: "Non-IoM Residents"      },
    { id: "linguistic",   label: "🔴 Linguistic Fingerprint" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={S.card}>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          KBA Vulnerability Tool — Primary School Authentication
        </div>
        <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
          The IoM Government uses primary school name as a knowledge-based authentication
          (KBA) second factor. The system asks for two random letters from the school name.
          This tool demonstrates why this is insufficient as a security factor.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge color="#22c55e" bg="#052e16">35 state schools analysed</Badge>
          <Badge color="#f59e0b" bg="#1c1003">Public data only</Badge>
          <Badge color="#a78bfa" bg="#1e1040">No hacking — open enumeration</Badge>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e293b" }}>
        {panels.map(p => (
          <button key={p.id} onClick={() => setPanel(p.id)} style={{
            padding: "7px 14px", border: "none", background: "none", cursor: "pointer",
            color: panel === p.id ? "#60a5fa" : "#64748b",
            borderBottom: panel === p.id ? "2px solid #60a5fa" : "2px solid transparent",
            fontSize: 12, fontWeight: panel === p.id ? 600 : 400,
            marginBottom: -1, whiteSpace: "nowrap",
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {panel === "collision"   && <SchoolInspector/>}
      {panel === "bruteforce"  && <BruteForcePanel/>}
      {panel === "geo"         && <GeographicInferencePanel/>}
      {panel === "nonresident" && <NonResidentPanel/>}
      {panel === "linguistic"  && <LinguisticFingerprintPanel/>}
    </div>
  );
}
