import { useState } from "react"
import type { AppUser, Case, Screen } from "../types"
import StatusBadge from "../components/StatusBadge"

const SAMPLE_CASES: Case[] = [
  {
    id: "CASE-2026-0041",
    title: "Hawala Network — South Mumbai Corridor",
    status: "attention",
    entityCount: 87,
    documentCount: 14,
    lastActivity: "2 hours ago",
    investigators: ["PR", "AM"],
    pendingReview: 6,
  },
  {
    id: "CASE-2026-0038",
    title: "Narcotics Supply Chain — Andheri Cell",
    status: "open",
    entityCount: 53,
    documentCount: 8,
    lastActivity: "Yesterday",
    investigators: ["SK"],
    pendingReview: 0,
  },
  {
    id: "CASE-2026-0031",
    title: "Extortion Ring — Construction Sector",
    status: "open",
    entityCount: 124,
    documentCount: 22,
    lastActivity: "3 days ago",
    investigators: ["PR", "VM", "SK"],
    pendingReview: 2,
  },
  {
    id: "CASE-2026-0027",
    title: "Vehicle Theft Syndicate — NH-48",
    status: "archived",
    entityCount: 41,
    documentCount: 7,
    lastActivity: "2026-08-14",
    investigators: ["AM"],
    pendingReview: 0,
  },
  {
    id: "CASE-2026-0019",
    title: "Digital Fraud — UPI Mule Accounts",
    status: "open",
    entityCount: 211,
    documentCount: 31,
    lastActivity: "5 days ago",
    investigators: ["VM"],
    pendingReview: 11,
  },
]

const STATUS_LABELS: Record<Case["status"], string> = {
  open: "Active",
  attention: "Needs Attention",
  archived: "Archived",
}
const STATUS_BADGE: Record<Case["status"], "teal" | "amber" | "steel"> = {
  open: "teal",
  attention: "amber",
  archived: "steel",
}

interface CaseListPageProps {
  user: AppUser
  onOpenCase: () => void
}

export default function CaseListPage({ user, onOpenCase }: CaseListPageProps) {
  const [filter, setFilter] = useState<"all" | Case["status"]>("all")
  const [search, setSearch] = useState("")
  const [showNewCase, setShowNewCase] = useState(false)

  const canCreateCase = user.role === "Supervisor" || user.role === "System Admin"

  const filtered = SAMPLE_CASES.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Cases
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 0" }}>
            {SAMPLE_CASES.length} total · {SAMPLE_CASES.filter((c) => c.status !== "archived").length} active
          </p>
        </div>
        {canCreateCase && (
          <button
            onClick={() => setShowNewCase(true)}
            style={{
              background: "var(--amber)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + New Case
          </button>
        )}
      </div>

      {/* Filter/search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by title or case ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "7px 12px",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-xs)",
            fontSize: 13,
            color: "var(--text)",
            background: "var(--panel)",
            outline: "none",
            width: 280,
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "open", "attention", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-xs)",
                fontSize: 12,
                fontWeight: filter === f ? 600 : 400,
                cursor: "pointer",
                background: filter === f ? "var(--text)" : "var(--panel)",
                color: filter === f ? "#fff" : "var(--text-faint)",
                transition: "all 0.12s",
              }}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--panel)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "var(--text-faint)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-dim)", marginBottom: 6 }}>
              No cases found
            </div>
            <div style={{ fontSize: 13 }}>
              {search ? "Try a different search term." : "No cases match the current filter."}
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Entities</th>
                <th>Documents</th>
                <th>Pending Review</th>
                <th>Last Activity</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={onOpenCase}>
                  <td>
                    <span className="mono" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                      {c.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{c.title}</span>
                  </td>
                  <td>
                    <StatusBadge status={STATUS_BADGE[c.status]} label={STATUS_LABELS[c.status]} />
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 13 }}>
                      {c.entityCount}
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 13 }}>
                      {c.documentCount}
                    </span>
                  </td>
                  <td>
                    {c.pendingReview > 0 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          color: "var(--amber)",
                          fontWeight: 500,
                        }}
                      >
                        <span className="mono">{c.pendingReview}</span> pending
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--steel)" }}>—</span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-faint)", fontSize: 13 }}>{c.lastActivity}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {c.investigators.map((initials) => (
                        <span
                          key={initials}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "var(--amber-wash)",
                            color: "var(--amber)",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(180,83,9,0.2)",
                          }}
                        >
                          {initials}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New case modal (simplified) */}
      {showNewCase && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3,7,18,0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowNewCase(false)}
        >
          <div
            style={{
              background: "var(--panel)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-strong)",
              padding: "28px 28px 24px",
              width: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "var(--text)" }}>
              New Case
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                Case Title
              </label>
              <input
                type="text"
                placeholder="Brief descriptive title"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: 14,
                  background: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                Assign Investigator
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: 14,
                  background: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              >
                <option>Insp. Priya Rao (PR)</option>
                <option>Insp. Arjun Mehta (AM)</option>
                <option>Insp. Suresh Kumar (SK)</option>
                <option>Insp. Vikram Menon (VM)</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowNewCase(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-xs)",
                  background: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--text-dim)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewCase(false)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "var(--radius-xs)",
                  background: "var(--amber)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
