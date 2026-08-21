import { createContext, useContext, useEffect, useState } from 'react'

export interface Theme {
  id: string
  label: string
  description: string
  descriptionKey: string
  preview: [string, string, string]
  bg: string
  surface: string
  surfaceAlt: string
  accent: string
  accentLight: string
  accentText: string
  accentBorder: string
  gradientCard: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  /* RGB triplet used to build the elevation scale in globals.css.
     Dark themes use pure black; the light theme uses a soft cool tint. */
  shadowRgb: string
}

export const themes: Theme[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Dark purple — the classic TRACKBOOK look.',
    descriptionKey: 'theme.default.desc',
    preview: ['#16171f', '#1a1b2e', '#8B5CF6'],
    bg: '#16171f',
    surface: '#1a1b2e',
    surfaceAlt: '#13132a',
    accent: '#8B5CF6',
    accentLight: 'rgba(124,111,205,0.15)',
    accentText: '#a78bfa',
    accentBorder: 'rgba(124,111,205,0.35)',
    gradientCard: 'radial-gradient(circle at bottom left, rgba(124,111,205,0.3) 0%, #191a2a 60%)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: 'rgba(255,255,255,0.06)',
    shadowRgb: '0, 0, 0',
  },
  {
    id: 'midnight',
    label: 'Midnight Blue',
    description: 'Deep navy with electric blue accents.',
    descriptionKey: 'theme.midnight.desc',
    preview: ['#0d1117', '#161b22', '#2563EB'],
    bg: '#0d1117',
    surface: '#161b22',
    surfaceAlt: '#0d1117',
    accent: '#2563EB',
    accentLight: 'rgba(37,99,235,0.15)',
    accentText: '#60a5fa',
    accentBorder: 'rgba(37,99,235,0.35)',
    gradientCard: 'radial-gradient(circle at bottom left, rgba(37,99,235,0.3) 0%, #111827 60%)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: 'rgba(255,255,255,0.06)',
    shadowRgb: '0, 0, 0',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    description: 'Dark slate with green accents.',
    descriptionKey: 'theme.emerald.desc',
    preview: ['#0f1613', '#141f1a', '#059669'],
    bg: '#0f1613',
    surface: '#141f1a',
    surfaceAlt: '#0a1510',
    accent: '#059669',
    accentLight: 'rgba(5,150,105,0.15)',
    accentText: '#34d399',
    accentBorder: 'rgba(5,150,105,0.35)',
    gradientCard: 'radial-gradient(circle at bottom left, rgba(5,150,105,0.3) 0%, #101a15 60%)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: 'rgba(255,255,255,0.06)',
    shadowRgb: '0, 0, 0',
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Dark with vibrant rose-pink accents.',
    descriptionKey: 'theme.rose.desc',
    preview: ['#13100f', '#1e1614', '#e11d48'],
    bg: '#13100f',
    surface: '#1e1614',
    surfaceAlt: '#150a09',
    accent: '#e11d48',
    accentLight: 'rgba(225,29,72,0.15)',
    accentText: '#fb7185',
    accentBorder: 'rgba(225,29,72,0.35)',
    gradientCard: 'radial-gradient(circle at bottom left, rgba(225,29,72,0.3) 0%, #1a1010 60%)',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: 'rgba(255,255,255,0.06)',
    shadowRgb: '0, 0, 0',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Clean white with purple accents.',
    descriptionKey: 'theme.light.desc',
    preview: ['#f3f4f6', '#ffffff', '#7C3AED'],
    bg: '#f0f0f7',
    surface: '#ffffff',
    surfaceAlt: '#1a1625',
    accent: '#7C3AED',
    accentLight: 'rgba(124,58,237,0.08)',
    accentText: '#7C3AED',
    accentBorder: 'rgba(124,58,237,0.45)',
    gradientCard: 'radial-gradient(circle at bottom left, rgba(124,58,237,0.12) 0%, #f9f9ff 60%)',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    border: 'rgba(0,0,0,0.1)',
    shadowRgb: '15, 23, 42',
  },
]

interface ThemeContextValue {
  theme: Theme
  setThemeById: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setThemeById: () => {},
})

function hexDarken(hex: string, amount = 60): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - amount)
  const g = Math.max(0, ((n >> 8)  & 0xff) - amount)
  const b = Math.max(0, ( n        & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function applyFavicon(accent: string) {
  const dark = hexDarken(accent)
  const svg = [
    `<svg width="512" height="512" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">`,
    `<stop offset="0%" stop-color="${accent}"/>`,
    `<stop offset="100%" stop-color="${dark}"/>`,
    `</linearGradient></defs>`,
    `<rect x="6" y="6" width="88" height="88" rx="26" fill="url(#g)"/>`,
    `<rect x="6.75" y="6.75" width="86.5" height="86.5" rx="25.25" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="1.5"/>`,
    `<rect x="27" y="31" width="46" height="12" rx="6" fill="#fff"/>`,
    `<rect x="44" y="31" width="12" height="41" rx="6" fill="#fff"/>`,
    `</svg>`,
  ].join('')

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    document.head.appendChild(link)
  }
  // Force browser to reload by removing and re-adding
  link.href = ''
  link.href = url
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.style.setProperty('--color-bg',            t.bg)
  root.style.setProperty('--color-surface',       t.surface)
  root.style.setProperty('--color-surface-alt',   t.surfaceAlt)
  root.style.setProperty('--color-gradient-card', t.gradientCard)
  root.style.setProperty('--color-accent',        t.accent)
  root.style.setProperty('--color-accent-light',  t.accentLight)
  root.style.setProperty('--color-accent-text',   t.accentText)
  root.style.setProperty('--color-accent-border', t.accentBorder)
  root.style.setProperty('--color-gradient-card', t.gradientCard)
  root.style.setProperty('--color-text-primary',  t.textPrimary)
  root.style.setProperty('--color-text-secondary',t.textSecondary)
  root.style.setProperty('--color-text-muted',    t.textMuted)
  root.style.setProperty('--color-border',        t.border)
  root.style.setProperty('--shadow-rgb',          t.shadowRgb)
  applyFavicon(t.accent)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('hb-theme')
    return themes.find((t) => t.id === saved) ?? themes[0]
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function setThemeById(id: string) {
    const found = themes.find((t) => t.id === id)
    if (!found) return
    localStorage.setItem('hb-theme', id)
    setTheme(found)
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
