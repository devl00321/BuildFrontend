const ICONS: Record<string, string> = {
  person: "👤",
  phone: "📞",
  vehicle: "🚗",
  location: "📍",
  account: "🏦",
}

interface EntityChipProps {
  type: "person" | "phone" | "vehicle" | "location" | "account"
  label: string
  mono?: boolean
}

export default function EntityChip({ type, label, mono }: EntityChipProps) {
  return (
    <span className="entity-chip" style={mono ? { fontFamily: "var(--font-mono)", fontSize: 11 } : undefined}>
      <span style={{ fontSize: 11 }}>{ICONS[type] ?? "◆"}</span>
      {label}
    </span>
  )
}
