import { useState } from "react"
import type { AppUser, Screen } from "./types"
import LoginPage from "./pages/LoginPage"
import CaseListPage from "./pages/CaseListPage"
import InvestigatorConsolePage from "./pages/InvestigatorConsolePage"
import EvidencePage from "./pages/EvidencePage"
import AdminPage from "./pages/AdminPage"
import AuditTrailPage from "./pages/AuditTrailPage"
import ReviewQueuePage from "./pages/ReviewQueuePage"
import Topbar from "./components/Topbar"

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [screen, setScreen] = useState<Screen>("cases")

  if (!user) {
    return <LoginPage onLogin={(u) => { setUser(u); setScreen("cases") }} />
  }

  const handleNavigate = (s: Screen) => setScreen(s)
  const handleLogout = () => { setUser(null); setScreen("cases") }
  const handleOpenCase = () => setScreen("console")

  return (
    <>
      {/* Narrow viewport warning */}
      <div
        className="desktop-only-warning"
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          background: "var(--bg)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🖥</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
            Best viewed on desktop
          </div>
          <div style={{ fontSize: 14, color: "var(--text-faint)", maxWidth: 320 }}>
            VERITAS is a professional investigation tool designed for workstation screens (min. 1280px).
          </div>
        </div>
      </div>

      {/* App shell */}
      <div
        className="app-shell"
        style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 1024 }}
      >
        <Topbar user={user} screen={screen} onNavigate={handleNavigate} onLogout={handleLogout} />

        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screen === "cases" && (
            <CaseListPage user={user} onOpenCase={handleOpenCase} />
          )}
          {screen === "console" && (
            <InvestigatorConsolePage />
          )}
          {screen === "evidence" && (
            <EvidencePage />
          )}
          {screen === "admin" && (
            <AdminPage />
          )}
          {screen === "audit" && (
            <AuditTrailPage />
          )}
          {screen === "review-queue" && (
            <ReviewQueuePage />
          )}
        </main>
      </div>
    </>
  )
}
