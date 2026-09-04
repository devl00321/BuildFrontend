import { useState } from "react"
import StatusBadge from "../components/StatusBadge"

interface AuditEntry {
  timestamp: string
  file: string
  sourceLabel: string
  status: "success" | "error"
  entities: number
  newNodes: number
}

interface FilteredEdge {
  timestamp: string
  reason: "self_loop" | "phone_conflict" | "confidence_below_threshold" | "duplicate_edge"
  sourceDoc: string
  edge: string
}

const REASON_LABELS: Record<FilteredEdge["reason"], string> = {
  self_loop: "Self-loop",
  phone_conflict: "Phone conflict",
  confidence_below_threshold: "Low confidence",
  duplicate_edge: "Duplicate edge",
}

const AUDIT_ENTRIES: AuditEntry[] = [
  { timestamp: "2026-09-04 14:06:30", file: "FinTx-031.csv", sourceLabel: "Financial Transactions", status: "success", entities: 18, newNodes: 4 },
  { timestamp: "2026-09-04 14:05:12", file: "Surveillance-09.docx", sourceLabel: "Surveillance Report", status: "success", entities: 8, newNodes: 2 },
  { timestamp: "2026-09-04 14:03:05", file: "CDR-22-Sep.xlsx", sourceLabel: "Call Detail Records", status: "success", entities: 47, newNodes: 5 },
  { timestamp: "2026-09-04 14:02:11", file: "FIR-104.pdf", sourceLabel: "First Information Report", status: "success", entities: 12, newNodes: 3 },
  { timestamp: "2026-09-02 10:15:44", file: "suspect-photos.zip", sourceLabel: "Surveillance", status: "error", entities: 0, newNodes: 0 },
]

const FILTERED_EDGES: FilteredEdge[] = [
  { timestamp: "2026-09-04 14:03:41", reason: "self_loop", sourceDoc: "CDR-22-Sep.xlsx", edge: "98765 43210 → CALLED → 98765 43210" },
  { timestamp: "2026-09-04 14:03:41", reason: "phone_conflict", sourceDoc: "CDR-22-Sep.xlsx", edge: "98765 43210 → LINKED_TO → Ahmed Shah (conflicts with existing Ravi Kumar link)" },
  { timestamp: "2026-09-04 14:03:41", reason: "duplicate_edge", sourceDoc: "CDR-22-Sep.xlsx", edge: "Ravi Kumar → USES → 98765 43210 (already present)" },
  { timestamp: "2026-09-04 14:06:30", reason: "confidence_below_threshold", sourceDoc: "FinTx-031.csv", edge: "Person B → TRANSFERRED → Unknown Account (confidence 0.38)" },
]

const REASON_BADGE_COLOR: Record<FilteredEdge["reason"], string> = {
  self_loop: "#6B7280",
  phone_conflict: "#B45309",
  confidence_below_threshold: "#6B7280",
  duplicate_edge: "#0F766E",
}

export default function AuditTrailPage() {
  const [tab, setTab] = useState<"ingestion" | "filtered">("ingestion")

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
          Ingestion Audit Trail
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 0" }}>
          CASE-2026-0041 · Complete ingestion history and filtered edges
        </p>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 16, background: "transparent", borderBottom: "1px solid var(--border)" }}>
        <button className={`tab-btn ${tab === "ingestion" ? "active" : ""}`} onClick={() => setTab("ingestion")}>
          Ingestion Log
          <span className="mono" style={{ fontSize: 10, color: "var(--steel)", marginLeft: 2 }}>
            ({AUDIT_ENTRIES.length})
          </span>
        </button>
        <button className={`tab-btn ${tab === "filtered" ? "active" : ""}`} onClick={() => setTab("filtered")}>
          Filtered Edges
          <span className="mono" style={{ fontSize: 10, color: "var(--amber)", marginLeft: 2 }}>
            ({FILTERED_EDGES.length})
          </span>
        </button>
      </div>

      {tab === "ingestion" && (
        <div
          style={{
            background: "var(--panel)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Filename</th>
                <th>Source Type</th>
                <th>Status</th>
                <th>Entities Extracted</th>
                <th>New Nodes</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_ENTRIES.map((e, i) => (
                <tr key={i} style={{ cursor: "default" }}>
                  <td>
                    <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      {e.timestamp}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{e.file}</span>
                  </td>
                  <td style={{ color: "var(--text-faint)", fontSize: 13 }}>{e.sourceLabel}</td>
                  <td>
                    <StatusBadge
                      status={e.status === "success" ? "teal" : "red"}
                      label={e.status === "success" ? "Success" : "Error"}
                    />
                  </td>
                  <td>
                    {e.status === "error" ? (
                      <span style={{ color: "var(--steel)" }}>—</span>
                    ) : (
                      <span className="mono" style={{ fontSize: 13 }}>
                        {e.entities}
                      </span>
                    )}
                  </td>
                  <td>
                    {e.status === "error" ? (
                      <span style={{ color: "var(--steel)" }}>—</span>
                    ) : (
                      <span className="mono" style={{ fontSize: 13 }}>
                        +{e.newNodes}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "filtered" && (
        <>
          <div
            style={{
              padding: "10px 14px",
              background: "var(--amber-wash)",
              border: "1px solid rgba(180,83,9,0.2)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--amber)",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            <strong>Audit visibility:</strong> The following edges were automatically removed by the system during processing. They are recorded here so nothing is hidden from auditors. No data has been silently discarded.
          </div>
          <div
            style={{
              background: "var(--panel)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Reason</th>
                  <th>Source Document</th>
                  <th>Filtered Edge</th>
                </tr>
              </thead>
              <tbody>
                {FILTERED_EDGES.map((e, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td>
                      <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>
                        {e.timestamp}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-xs)",
                          fontSize: 11,
                          fontWeight: 500,
                          background: `${REASON_BADGE_COLOR[e.reason]}18`,
                          color: REASON_BADGE_COLOR[e.reason],
                          border: `1px solid ${REASON_BADGE_COLOR[e.reason]}35`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {REASON_LABELS[e.reason]}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        {e.sourceDoc}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-faint)", maxWidth: 340 }}>
                      {e.edge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
