import { useTheme } from '@/context/ThemeContext'

interface BrandLogoProps {
  iconSize?: number
  fontSize?: number
}

export function BrandLogo({ iconSize = 32, fontSize = 18 }: BrandLogoProps) {
  const { theme } = useTheme()

  const gradient = `linear-gradient(90deg, ${theme.textPrimary} 0%, ${theme.accentText} 100%)`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: iconSize * 0.28 }}>
      <img src="/favicon.svg" alt="Trackbook" style={{ width: iconSize, height: iconSize, flexShrink: 0 }} />
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
