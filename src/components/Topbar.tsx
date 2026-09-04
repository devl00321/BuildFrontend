import type { AppUser, Screen } from "../types"

interface TopbarProps {
  user: AppUser
  screen: Screen
  onNavigate: (s: Screen) => void
  onLogout: () => void
}

const NAV_ITEMS: { label: string; screen: Screen; roles?: string[] }[] = [
  { label: "Cases", screen: "cases" },
  { label: "Review Queue", screen: "review-queue" },
  { label: "Evidence", screen: "evidence" },
  { label: "Audit Trail", screen: "audit" },
  { label: "Admin", screen: "admin", roles: ["Supervisor", "System Admin"] },
]

export default function Topbar({ user, screen, onNavigate, onLogout }: TopbarProps) {
  const visibleNav = NAV_ITEMS.filter(
    (n) => !n.roles || n.roles.includes(user.role)
  )

  return (
    <header
      className="topbar-glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 24,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <button
        onClick={() => onNavigate("cases")}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            background: "var(--amber)",
            borderRadius: 4,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.18em",
            color: "var(--text)",
            textTransform: "uppercase",
          }}
        >
          VERITAS
        </span>
      </button>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {visibleNav.map((n) => (
          <button
            key={n.screen}
            onClick={() => onNavigate(n.screen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "var(--radius-xs)",
              fontSize: 13,
              fontWeight: screen === n.screen ? 600 : 400,
              color: screen === n.screen ? "var(--text)" : "var(--text-faint)",
              backgroundColor: screen === n.screen ? "rgba(0,0,0,0.06)" : "transparent",
              transition: "all 0.12s",
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{user.name}</span>
        <span
          className="badge steel"
          style={{ fontSize: 11, padding: "2px 7px" }}
        >
          {user.role}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-xs)",
            padding: "4px 10px",
            fontSize: 12,
            color: "var(--text-faint)",
            cursor: "pointer",
            transition: "all 0.12s",
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
