import { useState, useEffect, useRef, useMemo } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { LoginScreen } from "./auth/LoginScreen";
import { RestrictedArea } from "./restricted/RestrictedArea";
import { ComplianceArea } from "./restricted/compliance/ComplianceArea";
import { ISLANDS, ISLAND_KEYS } from "./data/constants";
import HIGHLIGHTS from "./highlights.json";
import ABOUT from "./about.json";

// ── Colour themes ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:"#0f172a", surface:"#1e293b", surface2:"#162032", border:"#1e293b", border2:"#334155",
    text:"#e2e8f0", muted:"#94a3b8", muted2:"#cbd5e1",
    blue:"#60a5fa", blueDim:"#1d4ed8", green:"#34d399", amber:"#fbbf24",
    purple:"#a78bfa", red:"#f87171", gold:"#C9A24A",
    iom:"#3b82f6", gsy:"#10b981", jsy:"#f59e0b", uk:"#94a3b8",
  },
  health: {
    bg:"#f0f9f8", surface:"#ffffff", surface2:"#e6f4f1", border:"#cce8e4", border2:"#99d5cc",
    text:"#0f172a", muted:"#3d6b65", muted2:"#1e4a44",
    blue:"#2f7d6c", blueDim:"#e6f4f1", green:"#059669", amber:"#d97706",
    purple:"#7c3aed", red:"#dc2626", gold:"#92600a",
    iom:"#1d4ed8", gsy:"#059669", jsy:"#b45309", uk:"#475569",
  },
  light: {
    bg:"#f8fafc", surface:"#ffffff", surface2:"#f1f5f9", border:"#e2e8f0", border2:"#cbd5e1",
    text:"#0f172a", muted:"#334155", muted2:"#475569",
    blue:"#2563eb", blueDim:"#1d4ed8", green:"#059669", amber:"#d97706",
    purple:"#7c3aed", red:"#dc2626", gold:"#92600a",
    iom:"#1d4ed8", gsy:"#059669", jsy:"#d97706", uk:"#64748b",
  },
};

const TAB_GROUPS = [
  { id: "econ-group",      label: "Economy & Society",  color: "#34d399", homeTab: "econHome",
    tabs: [
      { id: "econHome",      label: "Overview"             },
      { id: "econperf",      label: "Economic Performance" },
      { id: "econmix",       label: "Economic Mix"         },
      { id: "demog",         label: "Demographics Explorer" },
      { id: "iomPopChange",  label: "Population Change"    },
      { id: "inflation",     label: "Inflation"            },
      { id: "unemployment",  label: "Unemployment"         },
      { id: "suicide",       label: "Suicide Rates"        },
    ]
  },
  { id: "gov-group",       label: "Government",          color: "#60a5fa", homeTab: "govHome",
    tabs: [
      { id: "govHome",           label: "Overview"             },
      { id: "iomfiscaldept",     label: "Fiscal Sources & Uses"},
      { id: "workforce",         label: "Public Sector Workforce" },
      { id: "iomPensionChallenge", label: "Pension Explorer"  },
      { id: "familyPension",     label: "Pension Picture"      },
    ]
  },
  { id: "household-group", label: "Households",          color: "#fb923c", homeTab: "householdHome",
    tabs: [
      { id: "householdHome", label: "Overview"             },
      { id: "overview",      label: "Economic Overview"    },
      { id: "wages",         label: "Wages"                },
      { id: "affordability", label: "Affordability"        },
      { id: "mybudget",      label: "My Budget"            },
    ]
  },
  { id: "health-group",    label: "Health & Care",       color: "#5ea99a", homeTab: "healthHome",
    tabs: [
      { id: "healthHome",    label: "Overview"         },
      { id: "manxBenchmark", label: "Healthcare Explorer" },
      { id: "yourHealth",    label: "Your Health"      },
      { id: "mcWhenWho",     label: "Something's Wrong?" },
      { id: "nobles-flow",   label: "System View"      },
      { id: "nobles-v15",    label: "Simulation"       },
    ]
  },
  { id: "privacy-group",   label: "Privacy & Data",      color: "#a78bfa", homeTab: "privacyHome",
    tabs: [
      { id: "privacyHome",   label: "Overview"             },
      { id: "reid",          label: "Re-identification"    },
      { id: "kanon",         label: "k-Anonymity"          },
      { id: "areas",         label: "Area Rankings"        },
      { id: "restricted",    label: "🔒 Restricted"        },
      { id: "compliance",    label: "📋 Compliance"        },
    ]
  },
];

// Flat list for any code that needs to look up a tab by id
const TABS = TAB_GROUPS.flatMap(g => g.tabs);

// ── Permission helper ─────────────────────────────────────────────────────────
function hasPermission(user, perm) {
  const perms = user?.app_metadata?.permissions;
  return Array.isArray(perms) && perms.includes(perm);
}

// ── Staggered fade-in block ───────────────────────────────────────────────────
function FadeBlock({ show, delay, children, style, onVisible }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setVisible(true);
      onVisible && onVisible();
    }, delay);
    return () => clearTimeout(t);
  }, [show]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(6px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Netscape eulogy ───────────────────────────────────────────────────────────
function NetscapeEulogySpark({ play }) {
  const FRAMES = ["🌐","🌐💀","🌐😵","🌐😵‍💫","💾📺🖱️","📟💿🖨️","⌛🪦","🌐🪦✨"];
  const [frame, setFrame] = useState(0);
  const started = useRef(false);

  const runEulogy = () => {
    started.current = true;
    setFrame(0);
    let i = 0;
    const tick = () => {
      i++;
      setFrame(i);
      if (i < FRAMES.length - 1) setTimeout(tick, 620);
    };
    setTimeout(tick, 620);
  };

  useEffect(() => {
    if (!play || started.current) return;
    // Wait for fade-in to visibly complete before starting
    setTimeout(runEulogy, 550);
  }, [play]);

  return (
    <span style={{ fontStyle: "normal" }}>
      {FRAMES[frame]}{" "}
      {frame === FRAMES.length - 1 && (
        <button
          onClick={runEulogy}
          title="Replay Netscape Eulogy"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 9, color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "0 2px", verticalAlign: "middle",
            textDecoration: "underline", textDecorationStyle: "dotted",
          }}
        >
          ↺ eulogy
        </button>
      )}
    </span>
  );
}

// ── Typewriter headline ───────────────────────────────────────────────────────
function TypewriterHeadline({ C, isNarrow, onDone }) {
  const FULL = "Data can be dry, when it should be visceral.";
  const SPLIT = FULL.indexOf("visceral");
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setDisplayed(FULL.slice(0, i));
      if (i < FULL.length) {
        setTimeout(tick, isNarrow ? 20 : 55 + Math.random() * 45);
      } else {
        setTimeout(() => { setDone(true); onDone && onDone(); }, 300);
      }
    };
    const start = setTimeout(tick, 600);
    return () => clearTimeout(start);
  }, []);

  const prefix   = displayed.slice(0, SPLIT);
  const viscPart = displayed.slice(SPLIT);
  const inVisceral = displayed.length > SPLIT;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex", alignItems: "baseline", flexWrap: "wrap",
        minHeight: isNarrow ? 44 : 52,
      }}>
        {/* Prefix — monospace */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isNarrow ? 13 : 15,
          fontWeight: 400, color: C.text,
          letterSpacing: "0.01em", lineHeight: 1.4,
          whiteSpace: "pre",
        }}>
          {prefix}
        </span>

        {/* "visceral." — rainbow display, types in after prefix */}
        {inVisceral && (
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: isNarrow ? 28 : 38,
            fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1,
            background: "linear-gradient(90deg,#f87171,#fb923c,#fbbf24,#34d399,#60a5fa,#a78bfa,#f87171)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            animation: "obs-rainbow 3s linear infinite",
          }}>
            {viscPart}
          </span>
        )}

        {/* Blinking cursor */}
        {!done && (
          <span style={{
            display: "inline-block", width: 2,
            height: inVisceral ? (isNarrow ? "1.6em" : "2em") : "0.9em",
            background: inVisceral ? "#a78bfa" : C.text,
            marginLeft: 2, verticalAlign: "baseline",
            animation: "obs-blink 0.7s step-end infinite",
          }}/>
        )}
      </div>
      <style>{`
        @keyframes obs-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes obs-rainbow { 0%{background-position:0% center} 100%{background-position:200% center} }
      `}</style>
    </div>
  );
}

// ── Site landing page ─────────────────────────────────────────────────────────
function LandingTab({ C, onNavigate, isNarrow }) {
  const totalPop = ISLAND_KEYS.reduce((s, k) => s + ISLANDS[k].population, 0);
  const [typingDone, setTypingDone] = useState(false);
  const d = isNarrow ? 0 : 1; // delay multiplier — mobile sees everything immediately
  const [netscapePlaying, setNetscapePlaying] = useState(false);

  const highlight = ({ color, section, tabId, title, desc, tag }) => (
    <div
      key={tabId + section}
      onClick={() => onNavigate(tabId)}
      style={{
        background: C.surface, border: `1px solid ${C.border2}`,
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border2}
    >
      <div style={{ height: 3, background: color }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: color, textTransform: "uppercase",
            letterSpacing: "0.08em", whiteSpace: "nowrap", paddingTop: 1 }}>{section}</div>
        </div>
        {tag && (
          <div style={{ fontSize: 10, color: color, background: color + "18",
            borderRadius: 4, padding: "2px 7px", display: "inline-block",
            fontWeight: 600, letterSpacing: "0.05em", marginBottom: 7 }}>{tag}</div>
        )}
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{desc}</div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%" }}>

      {/* Wide hero — two columns on desktop, single on mobile */}
      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 10, marginBottom: 28,
        display: "grid",
        gridTemplateColumns: isNarrow ? "1fr" : "1fr 220px",
        overflow: "hidden",
      }}>
        {/* Left — text */}
        <div style={{
          padding: isNarrow ? "20px 18px" : "28px 32px",
          borderRight: isNarrow ? "none" : `1px solid ${C.border2}`,
        }}>
          <TypewriterHeadline C={C} isNarrow={isNarrow} onDone={() => setTypingDone(true)} />

          {/* Body — staggered blocks, each waits for typing to complete */}

          <FadeBlock show={typingDone} delay={0 * d} style={{ marginBottom: 14 }} onVisible={() => setNetscapePlaying(true)}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              Sense-making in digestible diagrams. Information that travels.
              Communication means the message is received — not filed as a 250-page PDF
              on a site that has not been updated since the day{" "}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                color: C.amber, background: C.amber + "18",
                borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap",
              }}>Netscape died <NetscapeEulogySpark play={netscapePlaying} /></span>.
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={600 * d} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              Three islands that punch well above their weight.{" "}
              <span style={{ color: C.text, fontWeight: 500 }}>
                Including making data inaccessible.
              </span>
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={1300 * d} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              This sits at the intersection of data engineering, economic analysis,
              and visual communication — the kind of multi-discipline work everyone
              agrees matters, right up until it complicates a comfortable narrative.
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={2100 * d} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              <a href="https://www.nobelprize.org/prizes/economic-sciences/2001/akerlof/facts/"
                target="_blank" rel="noopener"
                style={{ color: C.muted2, textDecoration: "underline", textDecorationColor: C.border2 }}>
                George Akerlof
              </a>{" "}
              won the Nobel Prize for a paper about used cars 🍋🍑. The salesman knows which
              cars are lemons 🍋 and which are peaches 🍑. The buyer doesn't. So the buyer
              offers an average price — too low for the peach owner to accept. The peach
              never gets sold. The market fills with lemons. The information gap does the damage.
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={2900 * d} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              The corollary is less comfortable: control the information and you don't
              have to be the peach. <span style={{ color: C.text, fontWeight: 600 }}>Making data visible is not a neutral act.</span>
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={3600 * d} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.9, fontStyle: "italic" }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                color: C.muted, background: C.surface,
                borderRadius: 4, padding: "1px 6px", fontStyle: "normal",
              }}>80-page monthly performance report, anyone?</span>
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={4200 * d} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.9 }}>
              The Crown Dependencies govern, tax, and provide healthcare for fewer than{" "}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, fontWeight: 700 }}>
                260,000
              </span>{" "}
              people and produce an impressive volume of public statistics.
              This is an attempt to make them mean something.
            </div>
          </FadeBlock>

          <FadeBlock show={typingDone} delay={4900 * d}>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, fontStyle: "italic",
              borderTop: `1px solid ${C.border2}`, paddingTop: 12 }}>
              The headlines below have been collated with LLM assistance.
              I promise I'll make it more fun when I get round to it. 🔭
            </div>
          </FadeBlock>
        </div>

        {/* Right — island stats (desktop only) */}
        {!isNarrow && (
        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Coverage
          </div>
          {ISLAND_KEYS.map(k => (
            <div key={k} style={{ borderLeft: `3px solid ${ISLANDS[k].color}`, paddingLeft: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ISLANDS[k].color, marginBottom: 2 }}>
                {ISLANDS[k].name}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 19,
                fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 3 }}>
                {ISLANDS[k].population.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: C.muted2 }}>
                residents · {ISLANDS[k].areas.length} areas · 2021 census
              </div>
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.border2}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22,
              fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 3 }}>
              {totalPop.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: C.muted2 }}>total · 47 areas across three islands</div>
          </div>
        </div>
        )}
      </div>

      {/* Highlights — from highlights.json */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        Headlines
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 10, marginBottom: 28,
      }}>
        {HIGHLIGHTS.map(h => highlight(h))}
      </div>

      {/* Section navigator */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        Browse by section
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {TAB_GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => onNavigate(g.homeTab)}
            style={{
              background: "none", border: `1px solid ${g.color}44`,
              borderRadius: 7, padding: "8px 16px",
              color: g.color, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = g.color + "18"; e.currentTarget.style.borderColor = g.color; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = g.color + "44"; }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px",
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Data · </span>
        All figures sourced from public documents — government accounts, census publications,
        statistical bulletins. Where data is estimated, projected, or has known quality issues,
        that is flagged inline. Some sections are still being built out — amber "Work in progress"
        banners say where.{" "}
        <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

    </div>
  );
}

// ── Privacy & Data landing tab ────────────────────────────────────────────────
function PrivacyHomeTab({ C }) {
  const totalPop = ISLAND_KEYS.reduce((s, k) => s + ISLANDS[k].population, 0);

  const card = (title, body, accent) => (
    <div style={{
      background: C.surface, border: `1px solid ${C.border2}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 14,
    }}>
      <div style={{ height: 3, background: accent }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* Hero statement */}
      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: `3px solid ${C.blue}`,
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          How anonymous are you, really?
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.8 }}>
          Across the Crown Dependencies — <span style={{ color: C.text }}>Isle of Man</span>,{" "}
          <span style={{ color: C.text }}>Guernsey</span>, and{" "}
          <span style={{ color: C.text }}>Jersey</span> — a combined population of just{" "}
          <span style={{ color: C.text }}>{totalPop.toLocaleString()} people</span> live
          in some of the most re-identifiable communities in the world. Small populations
          make data anonymisation harder than most people realise.
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        What is re-identification?
      </div>

      {card(
        "Anonymous data isn't always anonymous",
        `When organisations publish or share "anonymised" data — removing names, addresses,
        and obvious identifiers — they often leave demographic attributes intact: age band,
        sex, marital status, occupation, ethnicity, area of residence. Individually, none
        of these identifies you. Combined, they can make you the only person in the dataset
        who matches that exact profile.`,
        C.blue
      )}

      {card(
        "The small population problem",
        `In a city of 8 million, knowing someone is a divorced 50-year-old woman working
        in finance still leaves thousands of possible matches. In a parish of 3,000 people,
        the same profile might match exactly one person. The Crown Dependencies — with
        populations between 63,000 and 103,000 — sit in a uniquely high-risk zone where
        everyday demographic data can function as a fingerprint.`,
        C.amber
      )}

      {card(
        "Why this matters for data protection",
        `Data protection law across the Crown Dependencies (aligned with GDPR) treats
        truly anonymous data as outside its scope. But if "anonymous" data can be
        re-identified using only publicly available census information, it may not
        qualify as anonymous at all — and sharing it could constitute a data breach.
        This observatory helps illustrate that risk.`,
        C.green
      )}

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Method · </span>
        This observatory uses the <em>population uniqueness</em> approach from Imperial College
        London's{" "}
        <a href="https://www.ooa.world" target="_blank"
          style={{ color: C.blue, textDecoration: "none" }}>Observatory of Anonymity (ooa.world)</a>,
        applied to Crown Dependencies census data. Marginal distributions come from the
        2021 census for each island. Attribute correlations are estimated from UK census
        microdata as a proxy. Results are illustrative — pending calibration data from
        Statistics IoM, Statistics Jersey, and Statistics Guernsey.
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        Coverage
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        {ISLAND_KEYS.map(k => (
          <div key={k} style={{
            flex: "1 1 180px",
            background: C.surface, border: `1px solid ${C.border2}`,
            borderRadius: 8, padding: "14px 16px",
            borderTop: `3px solid ${ISLANDS[k].color}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ISLANDS[k].color,
              marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {ISLANDS[k].name}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700,
              color: C.text, lineHeight: 1, marginBottom: 4 }}>
              {ISLANDS[k].population.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: C.muted2 }}>
              residents · {ISLANDS[k].areas.length} areas · 2021 census
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.7 }}>
        <a href="https://coalfinch.com" target="_blank"
          style={{ color: C.muted2, textDecoration: "none" }}>Coalfinch</a>
        {" "}· <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

    </div>
  );
}

// ── About tab ─────────────────────────────────────────────────────────────────
function AboutTab({ C }) {
  const A = ABOUT;

  const renderPara = (p, i, extraStyle = {}) => {
    const HIGHLIGHTS = [
      { find: "Making data visible is not a neutral act.",
        render: (k) => <span key={k} style={{ color: C.text, fontWeight: 600 }}>Making data visible is not a neutral act.</span> },
      { find: "half expecting a hit man",
        render: (k) => <span key={k} style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: C.amber, background: C.amber + "18",
          borderRadius: 4, padding: "1px 6px",
        }}>half expecting a hit man</span> },
      { find: "University of Glasgow",
        render: (k) => <span key={k} style={{ color: C.green, fontWeight: 500 }}>University of Glasgow</span> },
      { find: "Imperial College London",
        render: (k) => <span key={k} style={{ color: C.blue, fontWeight: 500 }}>Imperial College London</span> },
      { find: "Warwick Business School",
        render: (k) => <span key={k} style={{ color: C.amber, fontWeight: 500 }}>Warwick Business School</span> },
      { find: "Mrs Molyneux",
        render: (k) => <span key={k} style={{ color: C.muted2, fontStyle: "italic" }}>Mrs Molyneux</span> },
    ];

    let segments = [p];
    HIGHLIGHTS.forEach(({ find, render }) => {
      segments = segments.flatMap(seg => {
        if (typeof seg !== "string" || !seg.includes(find)) return [seg];
        const parts = seg.split(find);
        return parts.flatMap((part, idx) =>
          idx < parts.length - 1 ? [part, find] : [part]
        ).map((s, idx) => s === find ? render(find + idx) : s);
      });
    });

    segments = segments.flatMap((seg, si) => {
      if (typeof seg !== "string") return [seg];
      const parts = seg.split(/(\*[^*]+\*)/g);
      return parts.map((part, pi) =>
        part.startsWith("*") && part.endsWith("*")
          ? <em key={`em-${si}-${pi}`} style={{ color: C.muted }}>{part.slice(1, -1)}</em>
          : part
      );
    });

    return (
      <div key={i} style={{ fontSize: 13, color: C.muted2, lineHeight: 1.85,
        marginTop: i > 0 ? 10 : 0, ...extraStyle }}>
        {segments}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: `3px solid ${C.purple}`,
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          {A.hero.title}
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.85 }}>
          {A.hero.body}
        </div>
      </div>

      {/* Who */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 14 }}>{A.who.sectionLabel}</div>

      <div style={{ background: C.surface, border: `1px solid ${C.border2}`,
        borderRadius: 10, padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>
          {A.who.name}
        </div>
        {A.who.paragraphs.map((p, i) => {
          const isLast = i === A.who.paragraphs.length - 1;
          if (isLast) {
            const cleaned = p.replace(" please say so.", " ");
            return (
              <div key={i} style={{ fontSize: 13, color: C.muted2, lineHeight: 1.85, marginTop: 10 }}>
                {cleaned}
                <a href={"mailto:" + A.who.contactEmail}
                  style={{ color: C.purple, textDecoration: "none" }}>please say so</a>.
              </div>
            );
          }
          return renderPara(p, i);
        })}
      </div>

      {/* Coalfinch */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 14 }}>{A.coalfinch.sectionLabel}</div>

      <div style={{ background: C.surface, border: `1px solid ${C.border2}`,
        borderRadius: 10, padding: "18px 20px", marginBottom: 24 }}>
        {A.coalfinch.paragraphs.map((p, i) => renderPara(p, i))}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border2}` }}>
          <a href={A.coalfinch.url} target="_blank" rel="noopener"
            style={{ fontSize: 12, color: C.purple, textDecoration: "none", fontWeight: 500 }}>
            {A.coalfinch.urlLabel}
          </a>
        </div>
      </div>

      {/* Coverage */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 14 }}>{A.coverage.sectionLabel}</div>

      <div style={{ background: C.surface, border: `1px solid ${C.border2}`,
        borderRadius: 10, padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {A.coverage.sections.map(({ label, color, desc }) => (
            <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data quality */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 16,
        fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Data quality · </span>
        {A.dataQuality}
      </div>

      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.7 }}>
        <a href={"mailto:" + A.who.contactEmail}
          style={{ color: C.muted2, textDecoration: "none" }}>{A.who.contactEmail}</a>
        {" "}·{" "}
        <a href={A.coalfinch.url} target="_blank" rel="noopener"
          style={{ color: C.muted2, textDecoration: "none" }}>coalfinch.com</a>
        {" "}·{" "}
        <a href="/privacy4budget.html"
          style={{ color: C.muted2, textDecoration: "none" }}>Privacy Policy</a>
      </div>
    </div>
  );
}

// ── Government landing tab ───────────────────────────────────────────────────
function GovHomeTab({ C, onNavigate }) {

  const card = (title, body, accent, onClick) => (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border2}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 14,
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ height: 3, background: accent }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: `3px solid ${C.blue}`,
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          IoM Government finances &amp; public sector
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.8 }}>
          Fiscal flows, departmental expenditure, and public sector employment.
          Data extracted from IoM Treasury Pink Books and published accounts.
          Check the numbers — this is all technically public, just not easily accessible.
        </div>
      </div>

      {card(
        "Fiscal Sources & Uses",
        `Departmental breakdown of IoM government income and expenditure, FY2016–2025.
        Revenue sources flow through the General Revenue Account to department groups
        and expenditure types. Animate across years, focus on a department or spending
        category, and toggle constant prices. Data from IoM Treasury Pink Books.`,
        C.blue,
        () => onNavigate("iomfiscaldept")
      )}

      {card(
        "Public Sector Employment",
        `Government workforce size across the Crown Dependencies and the UK — absolute FTE
        and jobs counts, indexed change from a base year, and share of total employment.
        IoM from 1961 (Digest sector data) and 2015 (OHR FTE); Jersey core GOJ jobs
        2002–2023; Guernsey States FTE 2021–22; UK ONS G7G3 1999–2025.`,
        C.blue,
        () => onNavigate("workforce")
      )}

      {card(
        "Pension Explorer",
        `The Civil Service/GUS pension (PSPA, paid from General Revenue) and the Manx State
        Pension (paid from the National Insurance Fund) — modelled side by side. Switch
        between Combined, Public Sector, and State Pension views; drag levers for retirement
        age, contribution rates, and benefit indexation; and toggle population scenarios
        to see how the funding gap moves.`,
        C.blue,
        () => onNavigate("iomPensionChallenge")
      )}

      {card(
        "Your Family's Pension Picture",
        `Three generations. One island. Customise birth year and employment type for grandparent,
        parent and child — see pension outcomes side by side, the prior levy each working
        generation carries, and what the NI fund exhaustion means in practice.`,
        C.blue,
        () => onNavigate("familyPension")
      )}

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Data note · </span>
        IoM government data requires manual extraction from gov.im (automated access is blocked).
        All figures are from published Treasury documents — Pink Books, Annual Financial Statements,
        and the Digest of Economic and Social Statistics.
      </div>

      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.7 }}>
        <a href="https://coalfinch.com" target="_blank" rel="noopener"
          style={{ color: C.muted2, textDecoration: "none" }}>Coalfinch</a>
        {" "}·{" "}
        <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

    </div>
  );
}

// ── Economy & Society landing tab ────────────────────────────────────────────
function EconHomeTab({ C, onNavigate }) {

  const card = (title, body, accent) => (
    <div style={{
      background: C.surface, border: `1px solid ${C.border2}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 14,
    }}>
      <div style={{ height: 3, background: accent }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: `3px solid ${C.green}`,
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          Small islands, complex systems
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.8 }}>
          The same small populations that make re-identification risk acute also create
          unusual fiscal and demographic dynamics. A dependency ratio that would be a
          footnote in a nation of millions becomes a structural problem in an island of 85,000.
          This section explores those dynamics — population aging, inflation, unemployment,
          and the economic structure of small islands.
        </div>
      </div>

      <div style={{
        background: C.surface2, border: `1px solid ${C.amber}44`,
        borderLeft: `3px solid ${C.amber}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 12, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.amber, fontWeight: 700 }}>Work in progress · </span>
        This is an early-stage <strong style={{ color: C.text }}>systems dynamics model</strong> of
        the Crown Dependencies' fiscal position, currently being built out. The tools here
        are useful for orientation but the underlying data deserves scrutiny —
        much of it has been extracted from government PDFs, which is
        exactly as error-prone as it sounds. If you spot something wrong,{" "}
        <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.green, textDecoration: "none" }}>please tell us</a>.
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        Tools in this section
      </div>

      <div onClick={() => onNavigate("econperf")} style={{ cursor: "pointer" }}>
        {card(
          "Economic Performance",
          `GDP and GVA per head, real growth rates, and output relative to the UK across the
          Isle of Man, Jersey, and Guernsey — 2000 to present. Nominal and real (constant
          prices) series, with cross-jurisdictional ratio and cumulative indexed growth.
          Sources: IoM National Income reports, Statistics Jersey, States of Guernsey Statistics,
          ONS ABML/EBAQ/ABMI.`,
          C.green
        )}
      </div>

      <div onClick={() => onNavigate("demog")} style={{ cursor: "pointer" }}>
        {card(
          "Demographics Explorer",
          `Population aging across all three Crown Dependencies, 1821–2040. Census data plus
          cohort-shift projections. Dependency ratios, population pyramids, age structure,
          and what the trajectory looks like under different migration scenarios.`,
          C.green
        )}
      </div>

      <div onClick={() => onNavigate("econmix")} style={{ cursor: "pointer" }}>
        {card(
          "Productivity by Sector",
          `National income and employment by sector — contribution to GDP versus share of
          the workforce, revealing which sectors drive economic output relative to their
          size. Covers financial services, eGaming, ICT, health, education and the public
          sector. Data from IoM National Income reports and the Digest employment series.`,
          C.green
        )}
      </div>

      <div onClick={() => onNavigate("inflation")} style={{ cursor: "pointer" }}>
        {card(
          "Inflation Explorer",
          `CPI and RPI inflation across the Isle of Man, Jersey, Guernsey and the UK —
          annual rates, monthly series, and housing differentials. Covers 1950–2026,
          with IoM monthly data from 1977. Data sourced from Statistics IoM, Statistics
          Jersey, and ONS.`,
          C.green
        )}
      </div>

      <div onClick={() => onNavigate("unemployment")} style={{ cursor: "pointer" }}>
        {card(
          "Unemployment",
          `Long-run registered unemployment across all three Crown Dependencies and the UK,
          as far back as records allow — IoM from 1975, Guernsey from 1982, Jersey from 2001.
          Data from IoM Digest 2009 (Table 3.6), Statistics IoM Labour Market Reports,
          the Guernsey supplementary data spreadsheet (Q4 2023), and ONS BCJE.`,
          C.green
        )}
      </div>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>See also · </span>
        Wages, affordability, house prices, and the household budget tool are in the{" "}
        <strong style={{ color: C.text }}>Households</strong> section.
        Government finances, departmental budgets, and public sector employment are in{" "}
        <strong style={{ color: C.text }}>Government</strong>.
      </div>

      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.7 }}>
        <a href="https://coalfinch.com" target="_blank"
          style={{ color: C.muted2, textDecoration: "none" }}>Coalfinch</a>
        {" "}· <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

    </div>
  );
}

// ── Health & Care landing tab ─────────────────────────────────────────────────
function HealthHomeTab({ C, onNavigate }) {

  const card = (title, body, accent, onClick) => (
    <div onClick={onClick} style={{
      background: C.surface2, border: `1px solid ${C.border2}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 14,
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ height: 3, background: accent }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: "3px solid #5ea99a",
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.muted2,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          Health system performance across the Crown Dependencies
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.8 }}>
          Manx Care, Health and Care Jersey, Guernsey HSC, NHS Wales, and NHS England —
          compared across financial, clinical, operational, and off-island metrics.
          The same small-population dynamics that shape the fiscal picture shape health
          delivery too: a single hospital, a single integrated provider, and nowhere else
          to go if the system is under pressure.
        </div>
      </div>

      {/* Methodology note */}
      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: `3px solid ${C.blue}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 12, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>How this is built · </span>
        I use automated tools to accelerate extraction and comparison of data from published
        government and health body reports. The underlying sources are all public documents.
        Methodology differences between jurisdictions are flagged inline throughout the
        dashboard — those flags matter. If you are using figures operationally or in
        published work, cross-check against the primary source.{" "}
        <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.blue, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 12 }}>
        Tools in this section
      </div>

      {card(
        "Manx Care Benchmarking Dashboard",
        `Four KPI groups — Financial, Clinical, Operational, and Off-Island — comparing
        Manx Care's 2024-25 performance against Health and Care Jersey, Guernsey HSC,
        NHS Wales, and NHS England where data allows. Includes waiting list comparatives,
        cancer and ED standards, off-island mental health placement costs, and safety
        indicators from the Manx Care Integrated Performance Report (March 2024).
        Methodology breaks and data gaps are flagged inline — not suppressed.`,
        "#5ea99a",
        () => onNavigate("manxBenchmark")
      )}

      {card(
        "Nobles Simulation (current)",
        `Discrete-event simulation of bed capacity, occupancy, and throughput at Nobles
        Hospital. Models admission patterns, length-of-stay distributions, and discharge
        bottlenecks to illustrate how small changes in flow affect whole-system capacity.
        Use this to stress-test planning assumptions rather than as a forecast.`,
        "#5ea99a",
        () => onNavigate("nobles-v15")
      )}

      {card(
        "Noble's Hospital: A Systems View",
        `Why adding 50 beds to Noble's won't fix the crisis. A mobile-first explainer
        built on the Gent Review (June 2026) — queues, OPEL levels, DTOC patients, and
        the systems dynamics behind "the back door is the problem, not the front."
        Designed for anyone trying to understand what's actually going wrong.`,
        "#5ea99a",
        () => onNavigate("nobles-flow")
      )}

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Coming · </span>
        Jersey HCJ deep-dive · Guernsey HSC trend analysis · cross-island
        workforce and bed-capacity modelling · mental health placement cost projections.
        Data sources expand as annual reports are published.
      </div>

    </div>
  );
}


// ── Households landing tab ────────────────────────────────────────────────────
function HouseholdHomeTab({ C, onNavigate }) {

  const card = (title, body, accent, onClick) => (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border2}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 14,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.15s",
    }}>
      <div style={{ height: 3, background: accent }}/>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderLeft: "3px solid #fb923c",
        borderRadius: 10, padding: "20px 22px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text,
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
          What does life actually cost here?
        </div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.8 }}>
          The Isle of Man looks wealthy on paper. The median wage is marginally above the UK.
          But once you factor in housing costs, utilities, childcare, and basic essentials,
          the picture changes sharply. This section shows what residents actually earn,
          what they pay, and what — if anything — is left over. It ends with a tool
          you can use to map your own household situation and share it with your representative.
        </div>
      </div>

      <div onClick={() => onNavigate("overview")} style={{ cursor: "pointer" }}>
        {card(
          "Economic Overview — output vs income",
          `The Isle of Man is officially one of the richest places on earth. This page explains
          why that figure misleads, what GDP per head actually measures in a financial centre,
          and what the median wage tells you that GDP does not. Cross-jurisdiction comparison
          table with plain language and technical views.`,
          "#fb923c"
        )}
      </div>

      <div onClick={() => onNavigate("wages")} style={{ cursor: "pointer" }}>
        {card(
          "Wages",
          `Median and mean weekly wages, real purchasing power, labour share, and wage growth
          across the Crown Dependencies and the UK. Includes an IoM house-price-adjusted real
          earnings series — what wages have actually bought relative to housing costs since 2009.
          Sources: IoM Earnings Survey, Statistics Jersey IAE, States of Guernsey, ONS ASHE.`,
          "#fb923c"
        )}
      </div>

      <div onClick={() => onNavigate("affordability")} style={{ cursor: "pointer" }}>
        {card(
          "Affordability",
          `House prices, price-to-earnings ratios, real earnings change, and below-living-wage
          rates across all four jurisdictions. The IoM median earner faces a house price
          8.6 times annual earnings — above the UK's already-stretched 8.2× and more than
          double the international affordability threshold of 4×. Three illustrative household
          Sankeys show what take-home pay actually covers after essential costs.`,
          "#fb923c"
        )}
      </div>

      <div onClick={() => onNavigate("mybudget")} style={{ cursor: "pointer" }}>
        {card(
          "My Budget — build your own household Sankey",
          `Enter your income and actual costs. See a live Sankey diagram of where your money
          goes and what, if anything, remains. Share a link or print a copy to show your MHK
          or candidate exactly what your household situation looks like.
          Nothing is stored — your data never leaves your computer.`,
          "#fb923c"
        )}
      </div>

      <div style={{
        background: C.surface2, border: `1px solid ${C.border2}`,
        borderRadius: 8, padding: "14px 16px", marginBottom: 24,
        fontSize: 11, color: C.muted2, lineHeight: 1.7,
      }}>
        <span style={{ color: C.muted, fontWeight: 600 }}>Data note · </span>
        Spending figures are drawn from the IoM Minimum Income Standard (Living Wage Report,
        Statistics IoM 2024/25) — a government-defined minimum adequacy basket.
        We think it understates what many households actually spend, particularly on housing
        and childcare. Adjust everything in the budget tool to match your real situation.
        IoM income tax and National Insurance calculated using 2024/25 rates.
      </div>

      <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.7 }}>
        <a href="https://coalfinch.com" target="_blank" rel="noopener"
          style={{ color: C.muted2, textDecoration: "none" }}>Coalfinch</a>
        {" "}·{" "}
        <a href="mailto:observatory@coalfinch.com"
          style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
      </div>

    </div>
  );
}


function Centred({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh",
    }}>
      {children}
    </div>
  );
}

// ── Auto-sizing iframe ────────────────────────────────────────────────────────
function AutoIframe({ src, title, theme }) {
  const [height, setHeight] = useState("calc(100vh - 120px)");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data && e.data.type === "resize") {
        setHeight(e.data.height + "px");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Send theme to iframe on load and whenever it changes
  const sendTheme = () => {
    try { ref.current?.contentWindow?.postMessage({ type: "setTheme", theme }, "*"); } catch {}
  };
  useEffect(sendTheme, [theme]);

  const bg = THEMES[theme]?.bg ?? THEMES.dark.bg;

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      scrolling="no"
      onLoad={sendTheme}
      style={{
        width: "100%",
        height,
        border: "none",
        display: "block",
        overflow: "hidden",
        background: bg,
      }}
    />
  );
}

// ── Dropdown navigation ───────────────────────────────────────────────────────
function DropdownNav({ tab, setTab, C, groupOf, isNarrow }) {
  const [openGroup, setOpenGroup] = useState(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const navRef = useRef(null);
  const panelRef = useRef(null);
  const btnRefs = useRef({});

  // Close on outside click — but not if click is inside the panel itself
  useEffect(() => {
    const handler = (e) => {
      const inNav   = navRef.current   && navRef.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inNav && !inPanel) setOpenGroup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMenu = (groupId) => {
    if (openGroup === groupId) { setOpenGroup(null); return; }
    const btn = btnRefs.current[groupId];
    if (btn) {
      const r = btn.getBoundingClientRect();
      setPanelPos({ top: r.bottom + 2, left: isNarrow ? 12 : r.left });
    }
    setOpenGroup(groupId);
  };

  const activeGroup = TAB_GROUPS.find(g => g.tabs.some(t => t.id === tab));
  const openGroupData = TAB_GROUPS.find(g => g.id === openGroup);

  return (
    <>
    <div
      ref={navRef}
      style={{
        display: "flex", alignItems: "center", gap: 2,
        borderBottom: `1px solid ${C.border2}`,
        marginBottom: 20,
        overflowX: "auto",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* "Home" pill */}
      <button
        onClick={() => { setTab("home"); setOpenGroup(null); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12, fontWeight: tab === "home" ? 700 : 400,
          color: tab === "home" ? C.text : C.muted2,
          padding: "8px 14px 9px",
          borderBottom: tab === "home" ? `2px solid ${C.muted2}` : "2px solid transparent",
          marginBottom: -1, whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
      >
        Home
      </button>

      {/* Divider */}
      <div style={{ width:1, height:16, background:C.border2, flexShrink:0, margin:"0 2px" }}/>

      {/* Section dropdown triggers */}
      {TAB_GROUPS.map(group => {
        const isOpen = openGroup === group.id;
        const groupActive = group.tabs.some(t => t.id === tab);
        return (
          <button
            key={group.id}
            ref={el => btnRefs.current[group.id] = el}
            onClick={() => openMenu(group.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: groupActive ? 700 : 400,
              color: groupActive ? group.color : (isOpen ? C.text : C.muted2),
              padding: "8px 14px 9px",
              borderBottom: groupActive ? `2px solid ${group.color}` : "2px solid transparent",
              marginBottom: -1, whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}
          >
            {group.label}
            <span style={{
              fontSize: 9, opacity: 0.7, marginTop: 1,
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s", display: "inline-block",
            }}>▾</span>
          </button>
        );
      })}

      {/* Divider + About */}
      <div style={{ width:1, height:16, background:C.border2, flexShrink:0, margin:"0 2px" }}/>
      <button
        onClick={() => { setTab("about"); setOpenGroup(null); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12, fontWeight: tab === "about" ? 600 : 400,
          color: tab === "about" ? C.muted2 : C.muted,
          padding: "8px 14px 9px",
          borderBottom: tab === "about" ? `2px solid ${C.muted2}` : "2px solid transparent",
          marginBottom: -1, whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
      >
        About
      </button>
    </div>

    {/* Dropdown panel — rendered outside the overflow nav to avoid clipping */}
    {openGroup && openGroupData && (
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: panelPos.top,
          left: isNarrow ? 12 : panelPos.left,
          right: isNarrow ? 12 : "auto",
          zIndex: 200,
          background: C.surface, border: `1px solid ${C.border2}`,
          borderRadius: 8, padding: "6px 0",
          minWidth: isNarrow ? "auto" : 200,
          maxHeight: "60vh", overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={() => { setTab(openGroupData.homeTab); setOpenGroup(null); }}
          style={{
            padding: "6px 14px 6px 12px",
            border: "none", background: "none", cursor: "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 700,
            color: openGroupData.color, textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block", width: "100%", textAlign: "left",
            marginBottom: 4,
          }}
        >
          {openGroupData.label} ↗
        </button>
        <div style={{ height: 1, background: C.border2, margin: "0 10px 4px" }}/>
        {openGroupData.tabs
          .filter(t => t.id !== openGroupData.homeTab)
          .map(t => {
            if (t.divider) return (
              <div key={t.id}>
                <div style={{ height: 1, background: C.border2, margin: "4px 10px" }}/>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "5px 12px 3px",
                }}>
                  {t.label}
                </div>
              </div>
            );
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setOpenGroup(null); }}
                style={{
                  padding: "7px 14px 7px 12px",
                  border: "none", background: "none", cursor: "pointer",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: tab === t.id ? 600 : 400,
                  color: (t.id === "restricted" || t.id === "compliance")
                    ? C.purple
                    : (tab === t.id ? openGroupData.color : C.muted2),
                  display: "block", width: "100%", textAlign: "left",
                  borderLeft: tab === t.id ? `2px solid ${openGroupData.color}` : "2px solid transparent",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = (t.id === "restricted" || t.id === "compliance") ? C.purple : C.muted2; }}
              >
                {t.label}
              </button>
            );
          })}
      </div>
    )}
    </>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
function AppContent() {
  const { user, authLoading } = useAuth();
  const [tab, setTab] = useState("home");

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [themeName, setThemeName] = useState(() => {
    try { return localStorage.getItem("observatory-theme") || "dark"; } catch { return "dark"; }
  });
  const C = THEMES[themeName] ?? THEMES.dark;

  // ── Manx Care auto-theme ───────────────────────────────────────────────────
  const preHCThemeRef = useRef(null);
  const activeGroup = TAB_GROUPS.find(g => g.tabs.some(t => t.id === tab));
  const isInHC = activeGroup?.id === "health-group";

  useEffect(() => {
    if (isInHC && themeName !== "health" && themeName !== "dark") return; // dark override OK
    if (isInHC && preHCThemeRef.current === null) {
      // Entering H&C — save current theme and switch to MC light
      preHCThemeRef.current = themeName === "health" ? "dark" : themeName;
      if (themeName !== "health") {
        setThemeName("health");
        try { localStorage.setItem("observatory-theme", "light"); } catch {}
      }
    } else if (!isInHC && preHCThemeRef.current !== null) {
      // Leaving H&C — restore saved theme
      const restore = preHCThemeRef.current;
      preHCThemeRef.current = null;
      setThemeName(restore);
      try { localStorage.setItem("observatory-theme", restore); } catch {}
    }
  }, [isInHC]);

  const toggleTheme = () => {
    let next;
    if (isInHC) {
      next = themeName === "dark" ? "health" : "dark";
    } else {
      next = themeName === "dark" ? "light" : "dark";
    }
    setThemeName(next);
    if (next === "health") preHCThemeRef.current = "dark"; // user chose MC light explicitly
    const lsVal = next === "health" ? "light" : next;
    try { localStorage.setItem("observatory-theme", lsVal); } catch {}
    document.querySelectorAll("iframe").forEach(f => {
      try { f.contentWindow.postMessage({ type:"theme", theme:lsVal }, "*"); } catch {}
    });
  };

  // ── Iframe keep-alive ──────────────────────────────────────────────────────
  const IFRAME_TABS = new Set([
    "reid","demog","iomPopChange","kanon","areas","iomfiscaldept","econmix","inflation",
    "unemployment","suicide","workforce","iomPensionChallenge","familyPension","manxBenchmark","econperf",
    "overview","wages","affordability","mybudget",
    "mcReviews","mcWhenWho","yourHealth","nobles-flow","nobles-v15",
  ]);
  useEffect(() => {
    // Send theme to newly-visible iframe
    if (IFRAME_TABS.has(tab)) {
      setTimeout(() => {
        document.querySelectorAll("iframe").forEach(f => {
          const themeForFrame = themeName === "health" ? "light" : themeName;
          try { f.contentWindow.postMessage({ type:"setTheme", theme:themeForFrame }, "*"); } catch {}
        });
      }, 100);
    }
  }, [tab]);

  // Track viewport width — hides header toggle on mobile (FAB takes over)
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = (e) => setIsNarrow(e.matches);
    sync(mq); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Mobile theme FAB — fixed bottom-right pill, only on narrow viewports
  useEffect(() => {
    const FAB_ID = "obs-theme-fab";
    let fab = document.getElementById(FAB_ID);
    if (!fab) {
      fab = document.createElement("button");
      fab.id = FAB_ID;
      document.body.appendChild(fab);
      Object.assign(fab.style, {
        position:"fixed", bottom:"20px", right:"16px", zIndex:"9999",
        border:"none", borderRadius:"999px",
        fontFamily:"'Inter',system-ui,sans-serif",
        fontSize:"13px", fontWeight:"600",
        padding:"11px 20px", cursor:"pointer",
        boxShadow:"0 3px 14px rgba(0,0,0,0.35)",
        display:"none", transition:"background 0.2s,color 0.2s", lineHeight:"1",
      });
    }
    fab.textContent = themeName === "dark" ? "☀ Light" : "◑ Dark";
    fab.onclick = toggleTheme;
    Object.assign(fab.style, {
      background: themeName === "dark" ? "#e2e8f0" : "#0f172a",
      color:      themeName === "dark" ? "#0f172a" : "#e2e8f0",
    });
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = (e) => { fab.style.display = e.matches ? "block" : "none"; };
    sync(mq); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [themeName]);

  const totalPop = ISLAND_KEYS.reduce((s, k) => s + ISLANDS[k].population, 0);

  const tabContent = {
    home:           <LandingTab C={C} onNavigate={setTab} isNarrow={isNarrow} />,
    about:          <AboutTab C={C} />,
    econHome:       <EconHomeTab C={C} onNavigate={setTab} />,

    healthHome:     <HealthHomeTab C={C} onNavigate={setTab} />,
    govHome:        <GovHomeTab C={C} onNavigate={setTab} />,
    privacyHome:    <PrivacyHomeTab C={C} />,
    householdHome:  <HouseholdHomeTab C={C} onNavigate={setTab} />,

    reid: (
      <AutoIframe src="/reidentification.html" title="Re-identification Observatory" theme={themeName} />
    ),
    kanon: (
      <AutoIframe src="/kanonymity.html" title="k-Anonymity Explorer" theme={themeName} />
    ),
    areas: (
      <AutoIframe src="/arealist.html" title="Area Risk Rankings" theme={themeName} />
    ),
    demog: (
      <AutoIframe src="/demographics-explorer.html" title="Demographics Explorer" theme={themeName} />
    ),
    iomPopChange: (
      <AutoIframe src="/iom-population-change.html" title="IoM Population Change" theme={themeName} />
    ),
    iomfiscaldept: (
      <AutoIframe src="/iomg-budget-sankey.html" title="IoM Government Fiscal Sources & Uses" theme={themeName} />
    ),
    inflation: (
      <AutoIframe src="/inflation-explorer.html" title="Inflation Explorer" theme={themeName} />
    ),
    unemployment: (
      <AutoIframe src="/unemployment-explorer.html" title="Unemployment Explorer" theme={themeName} />
    ),
    suicide: (
      <AutoIframe src="/suicide-rates.html" title="Suicide Mortality Rates" theme={themeName} />
    ),
    econmix: (
      <AutoIframe src="/iom-economic-mix.html" title="Productivity by Sector" theme={themeName} />
    ),
    econperf: (
      <AutoIframe src="/economic-performance.html" title="Economic Performance" theme={themeName} />
    ),
    overview: (
      <AutoIframe src="/overview.html" title="Economic Overview" theme={themeName} />
    ),
    wages: (
      <AutoIframe src="/wages.html" title="Wages" theme={themeName} />
    ),
    affordability: (
      <AutoIframe src="/affordability.html" title="Affordability" theme={themeName} />
    ),
    mybudget: (
      <AutoIframe src="/my-budget.html" title="My Budget" theme={themeName} />
    ),
    workforce: (
      <AutoIframe src="/public-sector-employment.html" title="Public Sector Employment" theme={themeName} />
    ),
    iomPensionChallenge: (
      <AutoIframe src="/iom_pension_explorer.html" title="IoM Pension Explorer — Public Sector & State Pension" theme={themeName} />
    ),
    familyPension: (
      <AutoIframe src="/fp.html" title="Your Family's Pension Picture" theme={themeName} />
    ),
    manxBenchmark: (
      <AutoIframe src="/manx-care-benchmark.html" title="Manx Care Benchmarking Dashboard" theme={themeName} />
    ),

    mcReviews: (
      <AutoIframe src="/manxcare-reviews-tracker.html" title="Manx Care Reviews Tracker" theme={themeName} />
    ),
    mcCancer: (
      <AutoIframe src="/cancer-care.html" title="Cancer Care" theme={themeName} />
    ),
    mcED: (
      <AutoIframe src="/ed-care.html" title="Emergency Department" theme={themeName} />
    ),
    yourHealth: (
      <AutoIframe src="/patient/index.html" title="Your Health, Your Island" theme={themeName} />
    ),
    mcWhenWho: (
      <AutoIframe src="/patient/when-to-see-who.html" title="When to See Who" theme={themeName} />
    ),

    "nobles-flow": (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:13, color:C.muted2, textAlign:"center", maxWidth:420, lineHeight:1.7 }}>
          Noble's Hospital: A Systems View opens as a full page for the best experience — the flow simulator and scenario controls are designed for a dedicated window.
        </div>
        <a
          href="/nobles-flow-frontend.html"
          target="_blank"
          rel="noopener"
          style={{
            display:"inline-block", padding:"9px 20px",
            background:"none", border:`1px solid ${C.gold}`,
            borderRadius:7, color:C.gold,
            fontFamily:"'JetBrains Mono',monospace", fontSize:12,
            textDecoration:"none", cursor:"pointer",
            transition:"background 0.15s",
          }}
        >
          Open Noble's Hospital: A Systems View →
        </a>
      </div>
    ),

    "nobles-v15": (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:13, color:C.muted2, textAlign:"center", maxWidth:420, lineHeight:1.7 }}>
          The Noble's Hospital simulation opens as a full page for the best experience — it uses multiple canvases and a real-time render loop that don't play well inside an iframe.
        </div>
        <a
          href="/nobles-hospital-sim-v15.html"
          target="_blank"
          rel="noopener"
          onClick={() => { try { localStorage.setItem("observatory-theme","dark"); } catch {} }}
          style={{
            display:"inline-block", padding:"9px 20px",
            background:"none", border:`1px solid ${C.gold}`,
            borderRadius:7, color:C.gold,
            fontFamily:"'JetBrains Mono',monospace", fontSize:12,
            textDecoration:"none", cursor:"pointer",
            transition:"background 0.15s",
          }}
        >
          Open Noble's Hospital simulation →
        </a>
      </div>
    ),

    restricted: authLoading
      ? <Centred><div style={{ color: C.muted, fontSize: 12 }}>Loading…</div></Centred>
      : !user
        ? <Centred><LoginScreen /></Centred>
        : hasPermission(user, "restricted")
          ? <RestrictedArea />
          : <Centred><div style={{ color: C.muted2, fontSize: 12 }}>Your account doesn't have access to this area.</div></Centred>,

    compliance: authLoading
      ? <Centred><div style={{ color: C.muted, fontSize: 12 }}>Loading…</div></Centred>
      : !user
        ? <Centred><LoginScreen /></Centred>
        : hasPermission(user, "compliance")
          ? <ComplianceArea />
          : <Centred><div style={{ color: C.muted2, fontSize: 12 }}>Your account doesn't have access to this area.</div></Centred>,
  };

  // Find which group a tab belongs to
  const groupOf = (id) => TAB_GROUPS.find(g => g.tabs.some(t => t.id === id));

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: C.bg, minHeight: "100vh",
      color: C.text, padding: isNarrow ? "14px 12px" : "20px 24px",
      transition: "background 0.2s, color 0.2s",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", gap:3 }}>
              {ISLAND_KEYS.map((k, i) => (
                <div key={i} style={{ width:4, height:28, background:ISLANDS[k].color, borderRadius:2 }}/>
              ))}
            </div>
            <div>
              <button
                onClick={() => setTab("home")}
                style={{
                  background:"none", border:"none", cursor:"pointer", padding:0,
                  fontFamily:"'Inter', system-ui, sans-serif",
                  textAlign:"left",
                }}
              >
                <h1 style={{ margin:0, fontSize:19, fontWeight:800, color:C.text, letterSpacing:"-0.01em" }}>
                  Crown Dependencies Observatory
                </h1>
              </button>
              <div style={{ color:C.muted2, fontSize:11, marginTop:2 }}>
                Isle of Man · Guernsey · Jersey — 2021 census ·{" "}
                {totalPop.toLocaleString()} residents · 47 areas
              </div>
            </div>
          </div>
          {!isNarrow && (
          <button onClick={toggleTheme} title={themeName==="dark"?"Switch to light mode":"Switch to dark mode"}
            style={{ background:"none", border:`1px solid ${C.border2}`, borderRadius:6, color:C.muted2,
              cursor:"pointer", fontFamily:"'Inter',system-ui,sans-serif", fontSize:11,
              padding:"5px 10px", whiteSpace:"nowrap", flexShrink:0,
              transition:"border-color 0.15s,color 0.15s", marginTop:2 }}>
            {themeName==="dark" ? "☀ Light" : "◑ Dark"}
          </button>
          )}
        </div>
      </div>

      {/* Dropdown nav */}
      <DropdownNav
        tab={tab} setTab={setTab}
        C={C}
        groupOf={groupOf}
        isNarrow={isNarrow}
      />

      {/* Iframe tabs — render only when active (lazy), avoids hidden canvas issues */}
      {IFRAME_TABS.has(tab) && (
        <div key={tab}>
          {tabContent[tab]}
        </div>
      )}
      {(tab === "home") && (
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>{tabContent[tab]}</div>
      )}
      {!IFRAME_TABS.has(tab) && tab !== "home" && tab !== "about" && (
        <div style={{ maxWidth:960, margin:"0 auto" }}>{tabContent[tab]}</div>
      )}
      {tab === "about" && (
        <div style={{ maxWidth:1280, margin:"0 auto" }}>{tabContent[tab]}</div>
      )}

      {/* Global footer — hidden on iframe tabs */}
      {!IFRAME_TABS.has(tab) && (
      <div style={{
        maxWidth: 960, margin: "32px auto 0", padding: "16px 0 4px",
        borderTop: `1px solid ${C.border2}`,
        fontSize: 11, color: C.muted2,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <span>
          <a href="https://coalfinch.com" target="_blank" rel="noopener"
            style={{ color: C.muted2, textDecoration: "none" }}>Coalfinch</a>
          {" "}·{" "}
          <a href="mailto:observatory@coalfinch.com"
            style={{ color: C.muted2, textDecoration: "none" }}>observatory@coalfinch.com</a>
        </span>
        <span>
          <a href="/privacy4budget.html"
            style={{ color: C.muted2, textDecoration: "none" }}>Privacy Policy</a>
        </span>
      </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
