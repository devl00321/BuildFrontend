import { useEffect } from "react"

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, width = 560 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3,7,18,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--panel)",
          borderRadius: "var(--radius)",
          width: Math.min(width, "100%" as unknown as number),
          maxWidth: width,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--steel)",
              fontSize: 18,
              lineHeight: 1,
              padding: "2px 6px",
              borderRadius: "var(--radius-xs)",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}
