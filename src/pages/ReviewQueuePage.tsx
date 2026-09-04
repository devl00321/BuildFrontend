import { useState } from "react"
import StatusBadge from "../components/StatusBadge"
import EntityChip from "../components/EntityChip"

interface ReviewItem {
  id: string
  caseId: string
  caseTitle: string
  type: "conflict" | "flagged" | "ambiguity"
  title: string
  desc: string
  confidence: number
  source: string
  resolved: boolean
}

const ALL_ITEMS: ReviewItem[] = [
  {
    id: "r1",
    caseId: "CASE-2026-0041",
    caseTitle: "Hawala Network",
    type: "conflict",
    title: "Duplicate Person",
    desc: '"Ravi Kumar" and "R. Kumar" — 4 shared attributes. Recommend merge.',
    confidence: 0.87,
    source: "FIR-104",
    resolved: false,
  },
  {
    id: "r2",
    caseId: "CASE-2026-0041",
    caseTitle: "Hawala Network",
    type: "flagged",
    title: "Phone Number Conflict",
    desc: "98765 43210 linked to both Ravi Kumar and Ahmed Shah. Requires resolution.",
    confidence: 0.73,
    source: "CDR-22-Sep",
    resolved: false,
  },
  {
    id: "r3",
    caseId: "CASE-2026-0041",
    caseTitle: "Hawala Network",
    type: "ambiguity",
    title: "Name Ambiguity",
    desc: '"Ahmed Shah" vs "Ahmad Shah" — different spelling, 2 shared contacts.',
    confidence: 0.61,
    source: "Surveillance-09",
    resolved: false,
  },
  {
    id: "r4",
    caseId: "CASE-2026-0031",
    caseTitle: "Extortion Ring",
    type: "conflict",
    title: "Vehicle Duplicate",
    desc: '"MH-04-AB-1234" and "MH04AB1234" — same vehicle, two records.',
    confidence: 0.95,
    source: "RC-Records-03",
    resolved: false,
  },
  {
    id: "r5",
    caseId: "CASE-2026-0031",
    caseTitle: "Extortion Ring",
    type: "flagged",
    title: "High-frequency Communication Spike",
    desc: "Rajesh Patil made 84 calls in 2 hours on 2026-09-01. Anomaly flagged.",
    confidence: 0.89,
    source: "CDR-19-Aug",
    resolved: false,
  },
  {
    id: "r6",
    caseId: "CASE-2026-0019",
    caseTitle: "Digital Fraud",
    type: "flagged",
    title: "Mule Account Network",
    desc: "Account cluster A7 through A19 shows coordinated transfer patterns. 11 accounts linked.",
    confidence: 0.82,
    source: "FinTx-UPI-202",
    resolved: false,
  },
]

const TYPE_BADGE: Record<ReviewItem["type"], "amber" | "red" | "steel"> = {
  conflict: "amber",
  flagged: "red",
  ambiguity: "steel",
}
const TYPE_LABEL: Record<ReviewItem["type"], string> = {
  conflict: "Conflict",
  flagged: "Flagged",
  ambiguity: "Ambiguity",
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState(ALL_ITEMS)
  const [filterCase, setFilterCase] = useState("all")
  const [filterType, setFilterType] = useState<"all" | ReviewItem["type"]>("all")

  const caseIds = Array.from(new Set(ALL_ITEMS.map((i) => i.caseId)))
  const activeItems = items.filter(
    (i) =>
      !i.resolved &&
      (filterCase === "all" || i.caseId === filterCase) &&
      (filterType === "all" || i.type === filterType)
  )

  const resolve = (id: string) => {
    setItems((items) => items.map((i) => (i.id === id ? { ...i, resolved: true } : i)))
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
          Review Queue
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 0" }}>
          All cases · {items.filter((i) => !i.resolved).length} unresolved items
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select
          value={filterCase}
          onChange={(e) => setFilterCase(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-xs)",
            fontSize: 13,
            background: "var(--panel)",
            color: "var(--text-dim)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">All Cases</option>
          {caseIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "conflict", "flagged", "ambiguity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "5px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-xs)",
                fontSize: 12,
                fontWeight: filterType === t ? 600 : 400,
                cursor: "pointer",
                background: filterType === t ? "var(--text)" : "var(--panel)",
                color: filterType === t ? "#fff" : "var(--text-faint)",
                textTransform: "capitalize",
                transition: "all 0.12s",
              }}
            >
              {t === "all" ? "All Types" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {activeItems.length === 0 ? (
        <div
          style={{
            padding: "80px 24px",
            textAlign: "center",
            background: "var(--panel)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: "var(--teal)", marginBottom: 6 }}>
            Queue clear
          </div>
          <div style={{ fontSize: 13 }}>No pending review items match the current filter.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {activeItems.map((item) => (
            <div key={item.id} className={`review-card ${item.type}`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <StatusBadge status={TYPE_BADGE[item.type]} label={TYPE_LABEL[item.type]} />
                    <span className="mono" style={{ fontSize: 10, color: "var(--steel)" }}>
                      {item.caseId}
                    </span>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--steel)", flexShrink: 0 }}>
                  {item.source}
                </span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 12, lineHeight: 1.5 }}>
                {item.desc}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--steel)", marginBottom: 3 }}>
                  <span>Confidence</span>
                  <span className="mono">{Math.round(item.confidence * 100)}%</span>
                </div>
                <div className="confidence-bar-track">
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${item.confidence * 100}%`,
                      background: item.confidence > 0.8 ? "var(--teal)" : item.confidence > 0.6 ? "var(--amber)" : "var(--red)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => resolve(item.id)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    border: "1px solid var(--teal)",
                    borderRadius: "var(--radius-xs)",
                    background: "var(--teal-wash)",
                    color: "var(--teal)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Merge
                </button>
                <button
                  onClick={() => resolve(item.id)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    border: "1px solid var(--red)",
                    borderRadius: "var(--radius-xs)",
                    background: "var(--red-wash)",
                    color: "var(--red)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
                <button
                  style={{
                    padding: "6px 12px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-xs)",
                    background: "none",
                    color: "var(--steel)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
