export function riskColor(pct) {
  if (pct >= 20) return "#ef4444";
  if (pct >= 5)  return "#f97316";
  if (pct >= 1)  return "#eab308";
  return "#22c55e";
}

export function RiskBadge({ pct }) {
  const color = riskColor(pct);
  const label = pct >= 20 ? "CRITICAL" : pct >= 5 ? "HIGH" : pct >= 1 ? "ELEVATED" : "LOW";
  return (
    <span style={{
      background: color, color: "#fff", fontSize: 9, fontWeight: 700,
      padding: "2px 5px", borderRadius: 3, letterSpacing: "0.06em", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:6, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"#94a3b8", marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color, fontWeight:600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2)+"%" : p.value}
        </div>
      ))}
    </div>
  );
}
