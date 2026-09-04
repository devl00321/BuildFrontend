import { useState } from "react"
import StatusBadge from "../components/StatusBadge"
import Modal from "../components/Modal"

interface EvidenceFile {
  id: string
  name: string
  uploadedBy: string
  uploadedAt: string
  size: string
  hashStatus: "verified" | "pending" | "error"
  hash: string
  merkleRoot?: string
  accessLog: { user: string; at: string; action: string }[]
}

const FILES: EvidenceFile[] = [
  {
    id: "ev1",
    name: "FIR-104.pdf",
    uploadedBy: "Insp. Priya Rao",
    uploadedAt: "2026-09-02 09:14",
    size: "1.2 MB",
    hashStatus: "verified",
    hash: "sha256:a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
    merkleRoot: "0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
    accessLog: [
      { user: "Insp. Priya Rao", at: "2026-09-02 09:14", action: "Uploaded" },
      { user: "Insp. Priya Rao", at: "2026-09-02 09:15", action: "Viewed" },
      { user: "DCP Arjun Mehta", at: "2026-09-03 11:40", action: "Viewed" },
      { user: "Anil Verma (Auditor)", at: "2026-09-04 10:22", action: "Viewed" },
    ],
  },
  {
    id: "ev2",
    name: "CDR-22-Sep.xlsx",
    uploadedBy: "Insp. Priya Rao",
    uploadedAt: "2026-09-02 11:02",
    size: "3.8 MB",
    hashStatus: "verified",
    hash: "sha256:f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2",
    merkleRoot: "0xe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    accessLog: [
      { user: "Insp. Priya Rao", at: "2026-09-02 11:02", action: "Uploaded" },
      { user: "Pooja Singh (Analyst)", at: "2026-09-04 08:55", action: "Viewed" },
    ],
  },
  {
    id: "ev3",
    name: "Surveillance-09.docx",
    uploadedBy: "Insp. Suresh Kumar",
    uploadedAt: "2026-09-03 14:37",
    size: "890 KB",
    hashStatus: "pending",
    hash: "sha256:pending",
    accessLog: [
      { user: "Insp. Suresh Kumar", at: "2026-09-03 14:37", action: "Uploaded" },
    ],
  },
  {
    id: "ev4",
    name: "FinTx-031.csv",
    uploadedBy: "Insp. Vikram Menon",
    uploadedAt: "2026-09-04 13:55",
    size: "2.1 MB",
    hashStatus: "pending",
    hash: "sha256:computing",
    accessLog: [
      { user: "Insp. Vikram Menon", at: "2026-09-04 13:55", action: "Uploaded" },
    ],
  },
]

const HASH_BADGE: Record<EvidenceFile["hashStatus"], "teal" | "amber" | "red"> = {
  verified: "teal",
  pending: "amber",
  error: "red",
}
const HASH_LABEL: Record<EvidenceFile["hashStatus"], string> = {
  verified: "Verified",
  pending: "Hash Pending",
  error: "Hash Error",
}

export default function EvidencePage() {
  const [selected, setSelected] = useState<EvidenceFile | null>(null)
  const [copied, setCopied] = useState(false)

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
            Evidence & Chain of Custody
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 0" }}>
            CASE-2026-0041 · {FILES.length} files
          </p>
        </div>
        <button
          style={{
            background: "var(--amber)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Upload Evidence
        </button>
      </div>

      {/* Drop zone */}
      <div className="drop-zone" style={{ marginBottom: 20 }}>
        Drop evidence files here, or click "Upload Evidence" above
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
        <table className="data-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Uploaded By</th>
              <th>Uploaded At</th>
              <th>Size</th>
              <th>Hash Status</th>
              <th>SHA-256 (truncated)</th>
            </tr>
          </thead>
          <tbody>
            {FILES.map((f) => (
              <tr key={f.id} onClick={() => setSelected(f)}>
                <td>
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>{f.name}</span>
                </td>
                <td style={{ fontSize: 13 }}>{f.uploadedBy}</td>
                <td>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    {f.uploadedAt}
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 12 }}>
                    {f.size}
                  </span>
                </td>
                <td>
                  <StatusBadge status={HASH_BADGE[f.hashStatus]} label={HASH_LABEL[f.hashStatus]} />
                </td>
                <td>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--steel)",
                      display: "inline-block",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      verticalAlign: "bottom",
                    }}
                  >
                    {f.hash === "sha256:pending" || f.hash === "sha256:computing"
                      ? "—"
                      : f.hash.slice(0, 32) + "…"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)} width={580}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <StatusBadge status={HASH_BADGE[selected.hashStatus]} label={HASH_LABEL[selected.hashStatus]} />
            </div>

            <div className="section-label" style={{ marginBottom: 6 }}>SHA-256 Hash</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xs)",
                marginBottom: 16,
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--text-dim)", flex: 1, wordBreak: "break-all" }}
              >
                {selected.hash}
              </span>
              <button
                onClick={() => copyHash(selected.hash)}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-xs)",
                  background: "var(--panel)",
                  cursor: "pointer",
                  color: copied ? "var(--teal)" : "var(--text-faint)",
                  flexShrink: 0,
                  transition: "color 0.15s",
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {selected.merkleRoot && (
              <>
                <div className="section-label" style={{ marginBottom: 6 }}>Merkle Root Reference</div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    padding: "8px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xs)",
                    marginBottom: 16,
                  }}
                >
                  {selected.merkleRoot}
                </div>
              </>
            )}

            <div className="section-label" style={{ marginBottom: 8 }}>Access History</div>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xs)",
                overflow: "hidden",
              }}
            >
              {selected.accessLog.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom: i < selected.accessLog.length - 1 ? "1px solid var(--border)" : "none",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "var(--text-dim)" }}>{entry.user}</span>
                  <span style={{ color: "var(--steel)", fontSize: 12 }}>{entry.action}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--steel)" }}>
                    {entry.at}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
