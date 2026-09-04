import type { RiskLevel } from "../types"

type Status = "teal" | "amber" | "red" | "steel"

interface StatusBadgeProps {
  status: Status
  label: string
  dot?: boolean
}

export default function StatusBadge({ status, label, dot = true }: StatusBadgeProps) {
  const dotColor: Record<Status, string> = {
    teal: "#0F766E",
    amber: "#B45309",
    red: "#B91C1C",
    steel: "#6B7280",
  }
  return (
    <span className={`badge ${status}`}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: dotColor[status],
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  )
}

export function riskToStatus(risk: RiskLevel): Status {
  if (risk === "clean") return "teal"
  if (risk === "attention") return "amber"
  return "red"
}
