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

export const mockApplications: Application[] = [
  {
    id: 1,
    role: 'Senior Frontend Developer',
    company: 'Starlight Systems',
    date: '12 Oct, 2023',
    updatedAt: '20 Oct, 2023',
    status: 'Entrevista',
    stars: 3,
    type: 'Remoto',
    icon: '☁️',
    note: 'Próxima entrevista técnica agendada para el 20 de Octubre con el CTO. Preparar ejemplos de microfrontends y arquitectura limpia.',
    contact: 'Elena Martínez (Recruiter)',
    salary: '$95,000 - $120,000',
    source: 'LinkedIn',
    url: 'https://linkedin.com/jobs/view/123456',
    activity: [
      { id: 1, date: '2023-10-12', label: 'Postulación enviada' },
      { id: 2, date: '2023-10-15', label: 'Primer contacto del recruiter', note: 'Elena me escribió por LinkedIn, muy amable. Llamada de 30 min.' },
      { id: 3, date: '2023-10-20', label: 'Entrevista técnica agendada', note: 'Con el CTO. Preparar microfrontends y arquitectura limpia.' },
    ],
  },
  {
    id: 2,
    role: 'UX/UI Design Lead',
    company: 'Nova FinTech',
    date: '10 Oct, 2023',
    updatedAt: '11 Oct, 2023',
    status: 'Aplicada',
    stars: 2,
    type: 'Híbrido',
    icon: '🚀',
    source: 'GetOnBoard',
  },
  {
    id: 3,
    role: 'Product Manager',
    company: 'Nexus Global Corp',
    date: '08 Oct, 2023',
    status: 'Rechazada',
    stars: 4,
    type: 'Presencial',
    icon: '🏢',
  },
  {
    id: 4,
    role: 'Backend Engineer (Go)',
    company: 'Protocol Labs',
    date: '05 Oct, 2023',
    updatedAt: '18 Oct, 2023',
    status: 'Oferta',
    stars: 5,
    type: 'Remoto',
    icon: '</>',
    salary: '$210,000',
    source: 'Indeed',
  },
  {
    id: 5,
    role: 'Senior Product Designer',
    company: 'Stripe',
    date: '02 Oct, 2023',
    status: 'Aplicada',
    stars: 4,
    type: 'Remoto',
    icon: '🎨',
    salary: '$140k - $180k',
  },
  {
    id: 6,
    role: 'Design Systems Lead',
    company: 'Figma',
    date: '01 Oct, 2023',
    updatedAt: '15 Oct, 2023',
    status: 'Screening',
    stars: 5,
    type: 'Remoto',
    icon: '✦',
    note: 'Call with Emily scheduled for tomorrow at 10 AM',
  },
  {
    id: 7,
    role: 'Principal UI Engineer',
    company: 'Airbnb',
    date: '28 Sep, 2023',
    status: 'Entrevista',
    stars: 3,
    type: 'Remoto',
    icon: '✦',
    tag: 'Top Pick',
  },
  {
    id: 8,
    role: 'Staff UX Designer',
    company: 'Robinhood',
    date: '25 Sep, 2023',
    status: 'Oferta',
    stars: 5,
    type: 'Remoto',
    icon: '🏆',
    salary: '$210,000',
    tag: 'New Offer',
  },
]
