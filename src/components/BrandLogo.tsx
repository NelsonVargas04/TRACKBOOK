import { useTheme } from '@/context/ThemeContext'

interface BrandLogoProps {
  /** Kept for backwards compatibility; no longer renders a tile. */
  iconSize?: number
  /** Wordmark font size in px. */
  fontSize?: number
}

export function BrandLogo({ fontSize = 26 }: BrandLogoProps) {
  const { theme } = useTheme()
  const underline = 5
  const gap = Math.max(4, Math.round(fontSize * 0.22))

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'Manrope, sans-serif',
        fontWeight: 800,
        fontSize,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: theme.textPrimary,
        paddingBottom: underline + gap,
        userSelect: 'none',
      }}
    >
      Trackbook
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: underline,
          borderRadius: underline,
          background: theme.accent,
        }}
      />
    </span>
  )
}
