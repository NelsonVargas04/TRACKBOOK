import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface Props {
  message: string
  onDismiss: () => void
  duration?: number
}

export function SuccessToast({ message, onDismiss, duration = 3000 }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: 300,
        }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.15)' }}>
          <CheckCircle size={16} style={{ color: '#22c55e' }} />
        </div>
        <p className="text-sm font-medium flex-1" style={{ color: 'var(--color-text-primary)' }}>
          {message}
        </p>
        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }} className="hover:opacity-60 transition-opacity">
          <X size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </div>
  )
}
