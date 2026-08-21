import { useTheme } from '@/context/ThemeContext'

interface BrandLoaderProps {
  /** Wordmark font size in px. */
  fontSize?: number
  /** Optional caption shown under the logo. */
  label?: string
}

/**
 * Full-screen branded loading state: the Trackbook wordmark with its accent
 * underline turned into an indeterminate loading bar that sweeps left → right.
 */
export function BrandLoader({ fontSize = 46, label }: BrandLoaderProps) {
  const { theme } = useTheme()
  const track = 6

  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center gap-5"
      style={{ background: 'var(--color-bg)' }}
    >
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: Math.round(fontSize * 0.28),
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 800,
          fontSize,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: theme.textPrimary,
          userSelect: 'none',
        }}
      >
        <span style={{ animation: 'fade-in-up 0.5s var(--ease-out) both' }}>Trackbook</span>

        {/* Loading track */}
        <span
          aria-hidden
          style={{
            position: 'relative',
            width: '100%',
            height: track,
            borderRadius: track,
            background: theme.accentLight,
            overflow: 'hidden',
          }}
        >
          {/* Sweeping accent segment */}
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '45%',
              borderRadius: track,
              background: theme.accent,
              boxShadow: `0 0 ${track * 2}px ${theme.accentBorder}`,
              animation: 'brand-sweep 1.1s var(--ease) infinite',
            }}
          />
        </span>
      </span>

      {label && (
        <span
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: theme.textMuted,
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
