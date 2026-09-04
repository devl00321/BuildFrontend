import { useState } from "react"
import type { AppUser } from "../types"

interface LoginPageProps {
  onLogin: (user: AppUser) => void
}

const DEMO_USERS: Record<string, AppUser> = {
  investigator: { name: "Insp. Priya Rao", role: "Investigator" },
  supervisor: { name: "DCP Arjun Mehta", role: "Supervisor" },
  analyst: { name: "Pooja Singh", role: "Analyst" },
  admin: { name: "System Admin", role: "System Admin" },
  auditor: { name: "Anil Verma", role: "Auditor" },
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username || !password) {
      setError("Username and password are required.")
      return
    }
    if (password.length < 3) {
      setError("Invalid credentials. Contact your system administrator if you have forgotten your password.")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const user = DEMO_USERS[username.toLowerCase()] ?? { name: username, role: "Investigator" as const }
      setLoading(false)
      onLogin(user)
    }, 900)
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial washes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,83,9,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Card */}
      <div
        style={{
          width: 380,
          background: "var(--panel)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "40px 36px 36px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--amber)",
              borderRadius: 6,
              margin: "0 auto 14px",
            }}
          />
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text)",
            }}
          >
            VERITAS
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-faint)",
              marginTop: 4,
              letterSpacing: "0.04em",
            }}
          >
            Criminal Intelligence Analysis System
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-faint)",
                marginBottom: 6,
                letterSpacing: "0.04em",
              }}
            >
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-xs)",
                fontSize: 14,
                color: "var(--text)",
                background: "var(--bg)",
                outline: "none",
                transition: "border-color 0.12s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--amber)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-faint)",
                marginBottom: 6,
                letterSpacing: "0.04em",
              }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-xs)",
                fontSize: 14,
                color: "var(--text)",
                background: "var(--bg)",
                outline: "none",
                transition: "border-color 0.12s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--amber)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "8px 12px",
                background: "var(--red-wash)",
                border: "1px solid rgba(185,28,28,0.25)",
                borderRadius: "var(--radius-xs)",
                fontSize: 13,
                color: "var(--red)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "var(--amber)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
              letterSpacing: "0.04em",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Authenticating
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "var(--text-faint)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Demo logins: investigator / supervisor / analyst / admin / auditor
          <br />
          (any password of 3+ chars)
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
