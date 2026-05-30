import { useTheme } from '@/context/ThemeContext'

interface BrandLogoProps {
  iconSize?: number
  fontSize?: number
}

function TrackbookIcon({ size, accent, accentDark }: { size: number; accent: string; accentDark: string }) {
  const id = `tb-grad-${accent.replace('#', '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentDark} />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill={`url(#${id})`} />
      <rect x="24" y="30" width="52" height="11" rx="5.5" fill="#fff" />
      <rect x="31" y="46" width="38" height="11" rx="5.5" fill="#fff" fillOpacity="0.82" />
      <rect x="39" y="62" width="22" height="11" rx="5.5" fill="#fff" fillOpacity="0.6" />
    </svg>
  )
}

function darken(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 60)
  const g = Math.max(0, ((n >> 8) & 0xff) - 60)
  const b = Math.max(0, (n & 0xff) - 60)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export function BrandLogo({ iconSize = 32, fontSize = 18 }: BrandLogoProps) {
  const { theme } = useTheme()

  const gradient = `linear-gradient(90deg, ${theme.textPrimary} 0%, ${theme.accentText} 100%)`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: iconSize * 0.28 }}>
      <TrackbookIcon size={iconSize} accent={theme.accent} accentDark={darken(theme.accent)} />
      <span
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize,
          fontWeight: 800,
          lineHeight: 1,
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Trackbook
      </span>
    </div>
  )
}
