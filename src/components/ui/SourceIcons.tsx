// Brand SVG icons for job sources

export function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export function IndeedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.01 0C7.265 0 4.21 1.39 4.21 5.39v1.21H2.64A2.64 2.64 0 0 0 0 9.24v10.12A2.64 2.64 0 0 0 2.64 22h1.57v.36A1.64 1.64 0 0 0 5.85 24h10.3a1.64 1.64 0 0 0 1.64-1.64V22h1.57A2.64 2.64 0 0 0 22 19.36V9.24a2.64 2.64 0 0 0-2.64-2.63h-1.57V5.39C17.79 1.39 14.745 0 11.01 0zm0 2.12c2.916 0 4.638 1.032 4.638 3.27v1.21H6.37V5.39c0-2.238 1.724-3.27 4.64-3.27zm0 7.18a4.45 4.45 0 1 1 0 8.9 4.45 4.45 0 0 1 0-8.9zm0 2.1a2.35 2.35 0 1 0 0 4.7 2.35 2.35 0 0 0 0-4.7z"/>
    </svg>
  )
}

export function GetOnBoardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zm0 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    </svg>
  )
}

export function GlassdoorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.02C22.5 6.23 17.79 1.5 12 1.5S1.5 6.23 1.5 12.02c0 4.87 3.22 9 7.69 10.35V17.5H7.5v-2.25h1.69v-1.7c0-1.68.99-2.6 2.52-2.6.73 0 1.49.13 1.49.13v1.64h-.84c-.83 0-1.08.51-1.08 1.04v1.49h1.84l-.29 2.25h-1.55v4.87C19.28 21.02 22.5 16.89 22.5 12.02z"/>
    </svg>
  )
}

export function ReferralIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

export function CompanyWebIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

export function OtherSourceIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

import type { Source } from '@/data/mockApplications'

export const SOURCE_CONFIG: Record<Source, {
  icon: React.ElementType
  color: string
  bg: string
  label: string
}> = {
  LinkedIn:   { icon: LinkedInIcon,   color: '#0A66C2', bg: 'rgba(10,102,194,0.12)',  label: 'LinkedIn'    },
  Indeed:     { icon: IndeedIcon,     color: '#2164f3', bg: 'rgba(33,100,243,0.12)',  label: 'Indeed'      },
  GetOnBoard: { icon: GetOnBoardIcon, color: '#00c27c', bg: 'rgba(0,194,124,0.12)',   label: 'GetOnBoard'  },
  Glassdoor:  { icon: GlassdoorIcon,  color: '#0caa41', bg: 'rgba(12,170,65,0.12)',   label: 'Glassdoor'   },
  Referido:   { icon: ReferralIcon,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Referido'    },
  Empresa:    { icon: CompanyWebIcon, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  label: 'Web empresa' },
  Otro:       { icon: OtherSourceIcon,color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Otro'        },
}

export function SourceBadge({ source }: { source: Source }) {
  const cfg = SOURCE_CONFIG[source]
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}
