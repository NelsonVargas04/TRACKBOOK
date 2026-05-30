import { useState } from 'react'

// Google Favicon service — reliable, no auth needed
function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

// Map from source name → clearbit domain
const SOURCE_DOMAINS: Record<string, string> = {
  'LinkedIn':       'linkedin.com',
  'Indeed':         'indeed.com',
  'GetOnBoard':     'getonbrd.com',
  'Glassdoor':      'glassdoor.com',
  'Google Careers': 'google.com',
  'Greenhouse':     'greenhouse.io',
  'Workday':        'workday.com',
  'BambooHR':       'bamboohr.com',
  'Lever':          'lever.co',
  'HackerRank':     'hackerrank.com',
  'CodeSignal':     'codesignal.com',
  'Coderbyte':      'coderbyte.com',
  'JazzHR':         'jazzhr.com',
  'InfoJobs':       'infojobs.net',
  'CompuTrabajo':   'computrabajo.com',
  'Jooble':         'jooble.org',
  'JobRapido':      'jobrapido.com',
  'JobGether':      'jobgether.com',
  'Remotive':       'remotive.com',
  'Mercado Libre':  'mercadolibre.com',
  'Globant':        'globant.com',
  'N5 Now':         'n5now.com',
  'Oowlish':        'oowlish.com',
  'Avature':        'avature.net',
  'Clerk':          'clerk.com',
}

// Accent colors for sources without a domain logo
const SOURCE_COLORS: Record<string, { color: string; bg: string }> = {
  'LinkedIn':       { color: '#0A66C2', bg: 'rgba(10,102,194,0.12)'  },
  'Indeed':         { color: '#2164f3', bg: 'rgba(33,100,243,0.12)'  },
  'GetOnBoard':     { color: '#00c27c', bg: 'rgba(0,194,124,0.12)'   },
  'Glassdoor':      { color: '#0caa41', bg: 'rgba(12,170,65,0.12)'   },
  'Referido':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'Empresa':        { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  'Google Careers': { color: '#4285F4', bg: 'rgba(66,133,244,0.12)'  },
  'Greenhouse':     { color: '#24a148', bg: 'rgba(36,161,72,0.12)'   },
  'Workday':        { color: '#f77f00', bg: 'rgba(247,127,0,0.12)'   },
  'BambooHR':       { color: '#7dc242', bg: 'rgba(125,194,66,0.12)'  },
  'Lever':          { color: '#0085ff', bg: 'rgba(0,133,255,0.12)'   },
  'HackerRank':     { color: '#2ec866', bg: 'rgba(46,200,102,0.12)'  },
  'CodeSignal':     { color: '#6b4fbb', bg: 'rgba(107,79,187,0.12)'  },
  'InfoJobs':       { color: '#ff6600', bg: 'rgba(255,102,0,0.12)'   },
  'CompuTrabajo':   { color: '#e63946', bg: 'rgba(230,57,70,0.12)'   },
  'Mercado Libre':  { color: '#ffe600', bg: 'rgba(255,230,0,0.15)'   },
  'Remotive':       { color: '#6366f1', bg: 'rgba(99,102,241,0.12)'  },
}

const FALLBACK_COLOR = { color: '#64748b', bg: 'rgba(100,116,139,0.12)' }

export function getSourceColor(source: string) {
  return SOURCE_COLORS[source] ?? FALLBACK_COLOR
}

// Fallback SVG icons
function ReferralIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function CompanyWebIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function EmailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  )
}

function OtherSourceIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

// SVG fallback icons for sources without domain logo
const SVG_ICONS: Record<string, React.ElementType> = {
  'Referido': ReferralIcon,
  'Empresa':  CompanyWebIcon,
  'Email':    EmailIcon,
  'EmailHighBar': EmailIcon,
  'ATS genérico': CompanyWebIcon,
}

// Component: logo image with fallback to SVG icon
export function SourceLogo({ source, size = 16 }: { source: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const domain = SOURCE_DOMAINS[source]
  const { color } = getSourceColor(source)
  const FallbackIcon = SVG_ICONS[source] ?? OtherSourceIcon

  if (domain && !failed) {
    return (
      <img
        src={faviconUrl(domain)}
        alt={source}
        width={size}
        height={size}
        style={{ borderRadius: 3, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    )
  }

  return <FallbackIcon size={size} color={color} />
}

export const KNOWN_SOURCES: string[] = [
  'LinkedIn', 'Indeed', 'GetOnBoard', 'Glassdoor', 'Google Careers',
  'InfoJobs', 'CompuTrabajo', 'Jooble', 'JobRapido', 'JobGether', 'Remotive',
  'HackerRank', 'CodeSignal', 'Coderbyte', 'JazzHR', 'Lever',
  'Greenhouse', 'Workday', 'BambooHR', 'Avature', 'Clerk', 'ATS genérico',
  'Email', 'EmailHighBar',
  'Mercado Libre', 'N5 Now', 'Oowlish', 'Globant',
  'Referido', 'Empresa', 'Otro',
]

export function SourceBadge({ source }: { source: string }) {
  const { color, bg } = getSourceColor(source)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
      style={{ background: bg, color }}
    >
      <SourceLogo source={source} size={12} />
      {source}
    </span>
  )
}

// Legacy exports kept for compatibility
export function getSourceCfg(source: string) {
  const { color, bg } = getSourceColor(source)
  return { color, bg, label: source, icon: SVG_ICONS[source] ?? OtherSourceIcon }
}

export const SOURCE_CONFIG = Object.fromEntries(
  KNOWN_SOURCES.map(s => [s, getSourceCfg(s)])
)
