export type Screen =
  | "login"
  | "cases"
  | "console"
  | "evidence"
  | "admin"
  | "audit"
  | "review-queue"

export type UserRole =
  | "Investigator"
  | "Analyst"
  | "Supervisor"
  | "Forensic Officer"
  | "Prosecutor"
  | "System Admin"
  | "Auditor"

export interface AppUser {
  name: string
  role: UserRole
}

export interface Case {
  id: string
  title: string
  status: "open" | "archived" | "attention"
  entityCount: number
  documentCount: number
  lastActivity: string
  investigators: string[]
  pendingReview: number
}

export type RiskLevel = "clean" | "attention" | "high"

export interface GraphNode {
  id: string
  label: string
  type: "person" | "phone" | "vehicle" | "location" | "account"
  risk: RiskLevel
  cx: number
  cy: number
}

export interface GraphEdge {
  from: string
  to: string
  label: string
  confidence: number
}
