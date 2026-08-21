import { useState } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant
  size?: Size
  icon?: React.ElementType
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

const sizeStyles: Record<Size, { padding: string; fontSize: number; iconSize: number; gap: number }> = {
  sm: { padding: '6px 12px', fontSize: 12, iconSize: 13, gap: 6 },
  md: { padding: '9px 16px', fontSize: 14, iconSize: 15, gap: 8 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  className = '',
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const s = sizeStyles[size]
  const isDisabled = disabled || loading

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: 600,
    lineHeight: 1,
    borderRadius: 'var(--radius-md)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
    transform: !isDisabled && active ? 'translateY(1px)' : 'translateY(0)',
    transition:
      'background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease)',
  }

  const h = !isDisabled && hover
  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: 'var(--color-accent)',
      border: '1px solid transparent',
      color: '#fff',
      boxShadow: h ? '0 4px 16px var(--color-accent-border)' : '0 1px 3px var(--color-accent-border)',
      filter: h ? 'brightness(1.08)' : 'none',
    },
    secondary: {
      background: 'var(--color-surface)',
      border: `1px solid ${h ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
      color: 'var(--color-text-secondary)',
      boxShadow: h ? 'var(--shadow-sm)' : 'none',
    },
    ghost: {
      background: h ? 'var(--color-accent-light)' : 'transparent',
      border: '1px solid transparent',
      color: h ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
    },
    danger: {
      background: h ? 'rgba(239,68,68,0.12)' : 'transparent',
      border: `1px solid ${h ? 'rgba(239,68,68,0.35)' : 'var(--color-border)'}`,
      color: '#ef4444',
    },
  }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={className}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {loading
        ? <span style={{ width: s.iconSize, height: s.iconSize, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
        : Icon && <Icon size={s.iconSize} />}
      {children}
    </button>
  )
}
