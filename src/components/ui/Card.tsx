import { useState } from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  /** Adds a subtle lift + accent border on hover for interactive cards. */
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const [isHover, setIsHover] = useState(false)

  return (
    <div
      className={`p-7 ${className}`}
      onMouseEnter={hover ? () => setIsHover(true) : undefined}
      onMouseLeave={hover ? () => setIsHover(false) : undefined}
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${hover && isHover ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: hover && isHover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover && isHover ? 'translateY(-2px)' : 'translateY(0)',
        transition:
          'transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out), border-color var(--dur) var(--ease)',
      }}
    >
      {children}
    </div>
  )
}
