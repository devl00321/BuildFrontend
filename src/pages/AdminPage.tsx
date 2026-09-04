import { useState } from "react"
import StatusBadge from "../components/StatusBadge"
import type { UserRole } from "../types"

const ALL_ROLES: UserRole[] = [
  "Investigator",
  "Analyst",
  "Supervisor",
  "Forensic Officer",
  "Prosecutor",
  "System Admin",
  "Auditor",
]

interface UserRecord {
  id: string
  username: string
  fullName: string
  role: UserRole
  active: boolean
  lastLogin: string
}

const INITIAL_USERS: UserRecord[] = [
  { id: "u1", username: "investigator", fullName: "Insp. Priya Rao", role: "Investigator", active: true, lastLogin: "2026-09-04 14:02" },
  { id: "u2", username: "supervisor", fullName: "DCP Arjun Mehta", role: "Supervisor", active: true, lastLogin: "2026-09-04 09:11" },
  { id: "u3", username: "analyst", fullName: "Pooja Singh", role: "Analyst", active: true, lastLogin: "2026-09-04 08:55" },
  { id: "u4", username: "suresh.kumar", fullName: "Insp. Suresh Kumar", role: "Investigator", active: true, lastLogin: "2026-09-03 18:44" },
  { id: "u5", username: "vikram.menon", fullName: "Insp. Vikram Menon", role: "Investigator", active: false, lastLogin: "2026-08-28 10:30" },
  { id: "u6", username: "auditor", fullName: "Anil Verma", role: "Auditor", active: true, lastLogin: "2026-09-04 10:22" },
  { id: "u7", username: "admin", fullName: "System Admin", role: "System Admin", active: true, lastLogin: "2026-09-01 08:00" },
]

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS)
  const [pendingRole, setPendingRole] = useState<{ id: string; role: UserRole } | null>(null)
  const [pendingToggle, setPendingToggle] = useState<string | null>(null)

  const confirmRole = () => {
    if (!pendingRole) return
    setUsers((us) => us.map((u) => (u.id === pendingRole.id ? { ...u, role: pendingRole.role } : u)))
    setPendingRole(null)
  }

  const confirmToggle = () => {
    if (!pendingToggle) return
    setUsers((us) => us.map((u) => (u.id === pendingToggle ? { ...u, active: !u.active } : u)))
    setPendingToggle(null)
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
          Users & Roles
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 0" }}>
          {users.length} users · {users.filter((u) => u.active).length} active
        </p>
      </div>

      <div
        style={{
          background: "var(--panel)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ cursor: "default" }}>
                <td>
                  <span className="mono" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    {user.username}
                  </span>
                </td>
                <td style={{ fontWeight: 500, color: "var(--text)" }}>{user.fullName}</td>
                <td>
                  {pendingRole?.id === user.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--steel)" }}>
                        {user.role} →
                      </span>
                      <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>
                        {pendingRole.role}
                      </span>
                      <button
                        onClick={confirmRole}
                        style={{
                          fontSize: 11,
                          padding: "1px 7px",
                          border: "1px solid var(--teal)",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--teal-wash)",
                          color: "var(--teal)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingRole(null)}
                        style={{
                          fontSize: 11,
                          padding: "1px 7px",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius-xs)",
                          background: "none",
                          color: "var(--steel)",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        setPendingRole({ id: user.id, role: e.target.value as UserRole })
                      }
                      style={{
                        padding: "3px 7px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius-xs)",
                        fontSize: 12,
                        color: "var(--text-dim)",
                        background: "var(--bg)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  {pendingToggle === user.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--amber)" }}>
                        Set {user.active ? "inactive" : "active"}?
                      </span>
                      <button
                        onClick={confirmToggle}
                        style={{
                          fontSize: 11,
                          padding: "1px 7px",
                          border: "1px solid var(--amber)",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--amber-wash)",
                          color: "var(--amber)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingToggle(null)}
                        style={{
                          fontSize: 11,
                          padding: "1px 7px",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius-xs)",
                          background: "none",
                          color: "var(--steel)",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingToggle(user.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 9px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius-xs)",
                        background: "none",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: user.active ? "var(--teal)" : "var(--steel)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: user.active ? "var(--teal)" : "var(--steel)", fontWeight: 500 }}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  )}
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    {user.lastLogin}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
