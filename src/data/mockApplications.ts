export type Status = 'Aplicada' | 'Screening' | 'Entrevista' | 'Oferta' | 'Rechazada' | 'Ghosteado' | 'En Proceso'
export type Source = string

export type ActivityKind = 'event' | 'note'

export interface ActivityEntry {
  id: number
  date: string
  label: string
  note?: string
  kind?: ActivityKind
}

export interface Application {
  id: number
  role: string
  company: string
  date: string
  updatedAt?: string
  status: Status
  stars: number
  type: string
  salary?: string
  note?: string
  contact?: string
  tag?: string
  icon: string
  cvId?: number
  coverLetterId?: number
  url?: string
  source?: Source
  activity?: ActivityEntry[]
}

export const statusConfig: Record<Status, { color: string; bg: string; dot: string }> = {
  Aplicada:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: '#94a3b8' },
  Screening:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', dot: '#a78bfa' },
  Entrevista: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  Oferta:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  Rechazada:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  Ghosteado:  { color: '#64748b', bg: 'rgba(100,116,139,0.12)', dot: '#64748b' },
  'En Proceso': { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', dot: '#06b6d4' },
}
