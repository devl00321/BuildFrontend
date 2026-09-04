import { useState, useCallback } from "react"
import type { GraphNode, GraphEdge } from "../types"
import StatusBadge, { riskToStatus } from "../components/StatusBadge"
import EntityChip from "../components/EntityChip"

// ─── Graph Data ───────────────────────────────────────────────────────────────

const NODES: GraphNode[] = [
  { id: "ravi", label: "Ravi Kumar", type: "person", risk: "high", cx: 440, cy: 260 },
  { id: "ahmed", label: "Ahmed Shah", type: "person", risk: "attention", cx: 620, cy: 170 },
  { id: "phone1", label: "98765 43210", type: "phone", risk: "attention", cx: 528, cy: 172 },
  { id: "accY", label: "Account Y", type: "account", risk: "high", cx: 660, cy: 320 },
  { id: "personB", label: "Person B", type: "person", risk: "high", cx: 760, cy: 195 },
  { id: "vehicle", label: "MH-04-AB-1234", type: "vehicle", risk: "clean", cx: 295, cy: 150 },
  { id: "dharavi", label: "Dharavi Depot", type: "location", risk: "clean", cx: 220, cy: 315 },
  { id: "accZ", label: "Account Z", type: "account", risk: "attention", cx: 340, cy: 375 },
]

const EDGES: GraphEdge[] = [
  { from: "ravi", to: "phone1", label: "USES", confidence: 0.94 },
  { from: "phone1", to: "ahmed", label: "CALLED", confidence: 0.88 },
  { from: "ahmed", to: "accY", label: "CONTROLS", confidence: 0.76 },
  { from: "accY", to: "personB", label: "TRANSFERRED ₹2.4L", confidence: 0.83 },
  { from: "ravi", to: "vehicle", label: "OWNS", confidence: 0.97 },
  { from: "ravi", to: "dharavi", label: "LOCATED AT", confidence: 0.71 },
  { from: "ravi", to: "accZ", label: "CONTROLS", confidence: 0.81 },
]

const COMMUNITY_COLORS = ["#7C3AED", "#0369A1", "#B45309"]
const NODE_COMMUNITY: Record<string, number> = {
  ravi: 0, phone1: 0, accZ: 0,
  ahmed: 1, accY: 1, personB: 1,
  vehicle: 2, dharavi: 2,
}

const TYPE_ICONS: Record<GraphNode["type"], string> = {
  person: "P",
  phone: "☎",
  vehicle: "V",
  location: "L",
  account: "A",
}

const RISK_COLORS = {
  clean: { fill: "rgba(15,118,110,0.15)", stroke: "#0F766E" },
  attention: { fill: "rgba(180,83,9,0.15)", stroke: "#B45309" },
  high: { fill: "rgba(185,28,28,0.15)", stroke: "#B91C1C" },
}

// ─── Pipeline Stepper ────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "ingest", label: "Ingest", done: true },
  { id: "normalize", label: "Normalize", done: true },
  { id: "extract", label: "Extract", done: true },
  { id: "resolve", label: "Resolve", done: true },
  { id: "graph", label: "Graph", done: true },
  { id: "analyze", label: "Analyze", done: false, active: true },
  { id: "explain", label: "Explain", done: false, active: false },
]

function PipelineStepper() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "8px 16px",
        background: "rgba(255,255,255,0.6)",
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        flexShrink: 0,
      }}
    >
      {PIPELINE_STAGES.map((stage, i) => (
        <div key={stage.id} style={{ display: "flex", alignItems: "center" }}>
          <div
            className={`stepper-step ${stage.done ? "done" : stage.active ? "active" : "pending"}`}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: stage.done ? "var(--teal)" : stage.active ? "var(--amber)" : "var(--panel-2)",
                display: "inline-block",
                flexShrink: 0,
              }}
              className={stage.active ? "pulse-dot" : ""}
            />
            {stage.label}
          </div>
          {i < PIPELINE_STAGES.length - 1 && (
            <div className="stepper-connector" style={{ margin: "0 6px" }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Graph Canvas ────────────────────────────────────────────────────────────

interface GraphCanvasProps {
  selectedNode: GraphNode | null
  onSelectNode: (n: GraphNode | null) => void
  showCommunities: boolean
  pendingCount: number
}

function GraphCanvas({ selectedNode, onSelectNode, showCommunities, pendingCount }: GraphCanvasProps) {
  const getNode = (id: string) => NODES.find((n) => n.id === id)!

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Pending badge over canvas */}
      {pendingCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--amber-wash)",
            border: "1px solid rgba(180,83,9,0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "5px 10px",
            fontSize: 12,
            color: "var(--amber)",
            fontWeight: 600,
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }}
            className="pulse-dot"
          />
          {pendingCount} pending review
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {["＋", "－", "⊡"].map((icon) => (
          <button
            key={icon}
            style={{
              width: 30,
              height: 30,
              background: "var(--panel)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xs)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 900 520"
        style={{ width: "100%", height: "100%", display: "block" }}
        onClick={() => onSelectNode(null)}
      >
        {/* Edges */}
        {EDGES.map((edge) => {
          const from = getNode(edge.from)
          const to = getNode(edge.to)
          const mx = (from.cx + to.cx) / 2
          const my = (from.cy + to.cy) / 2
          const opacity = 0.3 + edge.confidence * 0.5
          const strokeWidth = 1 + edge.confidence * 1.5
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke="#6B7280"
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
              />
              <text
                x={mx}
                y={my - 5}
                textAnchor="middle"
                style={{ fontSize: 9, fill: "#6B7280", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                opacity={0.7}
              >
                {edge.label}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {NODES.map((node) => {
          const colors = RISK_COLORS[node.risk]
          const isSelected = selectedNode?.id === node.id
          const communityColor = showCommunities ? COMMUNITY_COLORS[NODE_COMMUNITY[node.id]] : undefined

          return (
            <g
              key={node.id}
              className={`graph-node${isSelected ? " selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                onSelectNode(isSelected ? null : node)
              }}
            >
              {/* Community halo */}
              {showCommunities && communityColor && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={24}
                  fill={`${communityColor}22`}
                  stroke={communityColor}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
              )}
              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={22}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  opacity={0.7}
                />
              )}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={18}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              <text
                x={node.cx}
                y={node.cy}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: colors.stroke,
                  fontFamily: "var(--font-body)",
                  pointerEvents: "none",
                }}
              >
                {TYPE_ICONS[node.type]}
              </text>
              <text
                x={node.cx}
                y={node.cy + 28}
                textAnchor="middle"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#1F2937",
                  fontFamily: "var(--font-body)",
                  pointerEvents: "none",
                }}
              >
                {node.label.length > 14 ? node.label.slice(0, 13) + "…" : node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(250,250,250,0.85)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xs)",
          padding: "8px 12px",
          fontSize: 11,
          color: "var(--text-faint)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="section-label" style={{ marginBottom: 6, fontSize: 10 }}>
          Legend
        </div>
        {[
          { color: "#B91C1C", label: "High Risk" },
          { color: "#B45309", label: "Attention" },
          { color: "#0F766E", label: "Verified" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: `${color}25`,
                border: `1.5px solid ${color}`,
                display: "inline-block",
              }}
            />
            <span>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)", color: "var(--steel)" }}>
          Edge opacity = confidence
        </div>
      </div>
    </div>
  )
}

// ─── Right Panel ─────────────────────────────────────────────────────────────

const REVIEW_ITEMS = [
  {
    id: "rv1",
    type: "conflict",
    title: "Duplicate Person",
    desc: '"Ravi Kumar" and "R. Kumar" — 4 shared attributes. Recommend merge.',
    confidence: 0.87,
    source: "FIR-104",
  },
  {
    id: "rv2",
    type: "flagged",
    title: "Phone Number Conflict",
    desc: "98765 43210 linked to both Ravi Kumar and Ahmed Shah. Requires resolution.",
    confidence: 0.73,
    source: "CDR-22-Sep",
  },
  {
    id: "rv3",
    type: "ambiguity",
    title: "Name Ambiguity",
    desc: '"Ahmed Shah" vs "Ahmad Shah" — different spelling, 2 shared contacts.',
    confidence: 0.61,
    source: "Surveillance-09",
  },
]

const EVIDENCE_PATH = [
  { type: "person" as const, label: "Ravi Kumar", source: "FIR-104" },
  { edge: "USES" },
  { type: "phone" as const, label: "98765 43210", source: "CDR-22-Sep" },
  { edge: "CALLED" },
  { type: "person" as const, label: "Ahmed Shah", source: "FIR-104" },
  { edge: "CONTROLS" },
  { type: "account" as const, label: "Account Y", source: "FinTx-031" },
  { edge: "TRANSFERRED ₹2.4L" },
  { type: "person" as const, label: "Person B", source: "FinTx-031" },
]

const CENTRALITY_METRICS = [
  { label: "Betweenness Centrality", value: "0.84" },
  { label: "Degree Connections", value: "4" },
  { label: "Communities Connected", value: "2" },
  { label: "Transaction Anomaly", value: "67%" },
  { label: "Communication Spike", value: "3.2×" },
  { label: "Evidence Sources", value: "6" },
]

const TOP_NODES = [
  { label: "Ravi Kumar", type: "person" as const, score: 0.84, id: "ravi" },
  { label: "Ahmed Shah", type: "person" as const, score: 0.62, id: "ahmed" },
  { label: "Account Y", type: "account" as const, score: 0.51, id: "accY" },
  { label: "98765 43210", type: "phone" as const, score: 0.44, id: "phone1" },
  { label: "Person B", type: "person" as const, score: 0.38, id: "personB" },
]

interface RightPanelProps {
  selectedNode: GraphNode | null
  showCommunities: boolean
  onToggleCommunities: () => void
  onSelectNodeById: (id: string) => void
  pendingCount: number
}

function RightPanel({ selectedNode, showCommunities, onToggleCommunities, onSelectNodeById, pendingCount }: RightPanelProps) {
  const [tab, setTab] = useState<"details" | "review" | "analysis">("details")
  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set())
  const [centralityMetric, setCentralityMetric] = useState<"degree" | "betweenness" | "pagerank">("betweenness")

  const activeItems = REVIEW_ITEMS.filter((r) => !resolvedItems.has(r.id))
  const reviewCount = activeItems.length

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--panel)", borderLeft: "1px solid var(--border)" }}>
      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>
          Details
        </button>
        <button className={`tab-btn ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>
          Review Queue
          {reviewCount > 0 && (
            <span className="count-badge">{reviewCount}</span>
          )}
        </button>
        <button className={`tab-btn ${tab === "analysis" ? "active" : ""}`} onClick={() => setTab("analysis")}>
          Analysis
        </button>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {/* ── Details ── */}
        {tab === "details" && (
          <div>
            {selectedNode ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <StatusBadge status={riskToStatus(selectedNode.risk)} label={selectedNode.risk === "clean" ? "Verified" : selectedNode.risk === "attention" ? "Attention" : "High Risk"} />
                    <span className="badge steel" style={{ textTransform: "capitalize" }}>
                      {selectedNode.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                    {selectedNode.label}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--steel)" }}>
                    ID: NODE-{selectedNode.id.toUpperCase()}
                  </div>
                </div>

                <div className="section-label" style={{ marginBottom: 8 }}>Connections</div>
                {EDGES.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).map((e) => {
                  const otherId = e.from === selectedNode.id ? e.to : e.from
                  const other = NODES.find((n) => n.id === otherId)!
                  return (
                    <div
                      key={`${e.from}-${e.to}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 0",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 13,
                      }}
                    >
                      <EntityChip type={other.type} label={other.label} />
                      <span style={{ fontSize: 10, color: "var(--steel)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                        {e.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </div>
                  )
                })}

                <div style={{ marginTop: 14 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Source Documents</div>
                  {["FIR-104", "CDR-22-Sep", "Surveillance-09"].slice(0, 2).map((doc) => (
                    <div
                      key={doc}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        background: "var(--bg)",
                        borderRadius: "var(--radius-xs)",
                        marginBottom: 6,
                        border: "1px solid var(--border)",
                        fontSize: 13,
                      }}
                    >
                      <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        {doc}
                      </span>
                      <button
                        style={{
                          fontSize: 11,
                          color: "var(--amber)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-faint)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", marginBottom: 4 }}>
                  No node selected
                </div>
                <div style={{ fontSize: 12 }}>Click a node on the graph to inspect it.</div>
              </div>
            )}
          </div>
        )}

        {/* ── Review Queue ── */}
        {tab === "review" && (
          <div>
            {activeItems.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-faint)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--teal)", marginBottom: 4 }}>
                  Queue clear
                </div>
                <div style={{ fontSize: 12 }}>All review items resolved.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeItems.map((item) => (
                  <div key={item.id} className={`review-card ${item.type}`}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{item.title}</div>
                      <span className="mono" style={{ fontSize: 10, color: "var(--steel)", marginLeft: 8, flexShrink: 0 }}>
                        {item.source}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 10, lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {/* Confidence bar */}
                      <div style={{ flex: 1 }}>
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
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button
                        onClick={() => setResolvedItems((s) => new Set([...s, item.id]))}
                        style={{
                          flex: 1,
                          padding: "5px",
                          border: "1px solid var(--teal)",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--teal-wash)",
                          color: "var(--teal)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Merge
                      </button>
                      <button
                        onClick={() => setResolvedItems((s) => new Set([...s, item.id]))}
                        style={{
                          flex: 1,
                          padding: "5px",
                          border: "1px solid var(--red)",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--red-wash)",
                          color: "var(--red)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                      <button
                        style={{
                          padding: "5px 10px",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius-xs)",
                          background: "none",
                          color: "var(--steel)",
                          fontSize: 11,
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
        )}

        {/* ── Analysis ── */}
        {tab === "analysis" && (
          <div>
            {/* Centrality metric selector */}
            <div className="section-label" style={{ marginBottom: 8 }}>
              Top Nodes by Centrality
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {(["betweenness", "degree", "pagerank"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCentralityMetric(m)}
                  style={{
                    padding: "3px 9px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-xs)",
                    fontSize: 11,
                    fontWeight: centralityMetric === m ? 600 : 400,
                    cursor: "pointer",
                    background: centralityMetric === m ? "var(--text)" : "transparent",
                    color: centralityMetric === m ? "#fff" : "var(--text-faint)",
                    textTransform: "capitalize",
                    transition: "all 0.12s",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {TOP_NODES.map((n, i) => (
              <div
                key={n.id}
                onClick={() => onSelectNodeById(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 8px",
                  borderRadius: "var(--radius-xs)",
                  cursor: "pointer",
                  marginBottom: 4,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  transition: "border-color 0.12s",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--panel-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--steel)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <EntityChip type={n.type} label={n.label} />
                <div style={{ flex: 1 }}>
                  <div className="confidence-bar-track">
                    <div
                      className="confidence-bar-fill"
                      style={{ width: `${n.score * 100}%`, background: "var(--amber)" }}
                    />
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", flexShrink: 0 }}>
                  {n.score.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Community toggle */}
            <div style={{ marginTop: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div className="section-label">Communities</div>
                <button
                  onClick={onToggleCommunities}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-xs)",
                    background: showCommunities ? "var(--teal-wash)" : "transparent",
                    color: showCommunities ? "var(--teal)" : "var(--text-faint)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {showCommunities ? "On" : "Off"}
                </button>
              </div>
              {[
                { color: COMMUNITY_COLORS[0], label: "Community 1", count: 3, desc: "Ravi group" },
                { color: COMMUNITY_COLORS[1], label: "Community 2", count: 3, desc: "Ahmed group" },
                { color: COMMUNITY_COLORS[2], label: "Community 3", count: 2, desc: "Locations" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>{c.label}</span>
                  <span style={{ color: "var(--steel)" }}>—</span>
                  <span style={{ color: "var(--text-faint)" }}>{c.count} members, {c.desc}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4, paddingLeft: 18 }}>
                Bridge: 98765 43210 connects Communities 1 & 2
              </div>
            </div>

            {/* Indicator table */}
            <div className="section-label" style={{ marginBottom: 8 }}>Node Indicators — Ravi Kumar</div>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xs)",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              {CENTRALITY_METRICS.map(({ label, value }, i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderBottom: i < CENTRALITY_METRICS.length - 1 ? "1px solid var(--border)" : "none",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--text-faint)" }}>{label}</span>
                  <span className="mono" style={{ fontWeight: 600, color: "var(--text-dim)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Evidence path */}
            <div className="section-label" style={{ marginBottom: 8 }}>Evidence Path</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {EVIDENCE_PATH.map((item, i) => {
                if ("edge" in item) {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "2px 0 2px 14px", gap: 4 }}>
                      <div style={{ width: 1, height: 12, background: "var(--border-strong)", marginRight: 6 }} />
                      <span
                        className="mono"
                        style={{ fontSize: 9, color: "var(--steel)", letterSpacing: "0.08em" }}
                      >
                        {item.edge}
                      </span>
                    </div>
                  )
                }
                return (
                  <div key={i} className="evidence-path-card">
                    <EntityChip type={item.type} label={item.label} />
                    <button
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        padding: "1px 6px",
                        background: "var(--amber-wash)",
                        border: "1px solid rgba(180,83,9,0.2)",
                        borderRadius: "var(--radius-xs)",
                        color: "var(--amber)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {item.source}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

const DOCUMENTS = [
  { name: "FIR-104.pdf", size: "1.2 MB", status: "done", entities: 12 },
  { name: "CDR-22-Sep.xlsx", size: "3.8 MB", status: "done", entities: 47 },
  { name: "Surveillance-09.docx", size: "890 KB", status: "done", entities: 8 },
  { name: "FinTx-031.csv", size: "2.1 MB", status: "active", entities: null },
]

const LOG_ENTRIES = [
  { time: "14:02:11", msg: "Ingestion complete — FIR-104.pdf", level: "success" },
  { time: "14:02:18", msg: "Extracted 12 entities from FIR-104", level: "success" },
  { time: "14:03:05", msg: "CDR-22-Sep.xlsx ingested", level: "success" },
  { time: "14:03:41", msg: "47 entities extracted, 3 duplicates detected", level: "warn" },
  { time: "14:05:12", msg: "Entity resolution pass complete", level: "success" },
  { time: "14:05:14", msg: "Graph construction: 8 nodes, 7 edges", level: "success" },
  { time: "14:06:30", msg: "Running analytics pass…", level: "" },
]

function LeftPanel() {
  const [running, setRunning] = useState(false)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span className="section-label">Documents</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--steel)" }}>
          {DOCUMENTS.length} files
        </span>
      </div>

      {/* Document list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 8px",
              borderRadius: "var(--radius-xs)",
              marginBottom: 3,
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>
              {doc.name.endsWith(".pdf") ? "📄" : doc.name.endsWith(".xlsx") ? "📊" : doc.name.endsWith(".csv") ? "🗃" : "📝"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--steel)", fontFamily: "var(--font-mono)" }}>
                {doc.size}
                {doc.entities !== null && ` · ${doc.entities} entities`}
              </div>
            </div>
            {doc.status === "done" ? (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 }} />
            ) : (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} className="pulse-dot" />
            )}
          </div>
        ))}

        {/* Drop zone */}
        <div className="drop-zone" style={{ marginTop: 8 }}>
          Drop files here or click to upload
        </div>

        {/* Run pipeline */}
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "8px",
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: running ? "var(--teal)" : "var(--amber)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "background 0.2s",
          }}
        >
          {running ? (
            <>
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Running…
            </>
          ) : (
            "▶ Run Pipeline"
          )}
        </button>

        {/* Log */}
        <div style={{ marginTop: 14 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>Processing Log</div>
          {LOG_ENTRIES.map((e, i) => (
            <div
              key={i}
              className={`log-entry ${e.level === "success" ? "log-success" : e.level === "warn" ? "log-warn" : ""}`}
            >
              <span className="log-time">{e.time}</span>
              {e.msg}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Main Console Page ────────────────────────────────────────────────────────

export default function InvestigatorConsolePage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showCommunities, setShowCommunities] = useState(false)

  const handleSelectNodeById = useCallback((id: string) => {
    const node = NODES.find((n) => n.id === id) ?? null
    setSelectedNode(node)
  }, [])

  const pendingCount = 3

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Case sub-header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 20px",
          background: "var(--panel)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div>
          <span className="mono" style={{ fontSize: 11, color: "var(--steel)" }}>CASE-2026-0041</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginLeft: 10 }}>
            Hawala Network — South Mumbai Corridor
          </span>
        </div>
        <StatusBadge status="amber" label="Needs Attention" />
      </div>

      {/* Pipeline stepper */}
      <PipelineStepper />

      {/* Three-column layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: 272px */}
        <div style={{ width: 272, flexShrink: 0, overflow: "hidden" }}>
          <LeftPanel />
        </div>

        {/* Center: flexible */}
        <div style={{ flex: 1, background: "var(--bg)", position: "relative", overflow: "hidden" }}>
          <GraphCanvas
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            showCommunities={showCommunities}
            pendingCount={pendingCount}
          />
        </div>

        {/* Right: 340px */}
        <div style={{ width: 340, flexShrink: 0, overflow: "hidden" }}>
          <RightPanel
            selectedNode={selectedNode}
            showCommunities={showCommunities}
            onToggleCommunities={() => setShowCommunities((v) => !v)}
            onSelectNodeById={handleSelectNodeById}
            pendingCount={pendingCount}
          />
        </div>
      </div>
    </div>
  )
}
