import { useEffect, useState, useRef } from 'react'
import { Trash2, RotateCcw, X } from 'lucide-react'

interface Props {
  message: string
  onUndo: () => void
  onDismiss: () => void
  duration?: number
}

export function UndoToast({ message, onUndo, onDismiss, duration = 5000 }: Props) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const dismissedRef = useRef(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    startRef.current = performance.now()

    function tick(now: number) {
      const elapsed = now - startRef.current
      const remaining = Math.max(0, 1 - elapsed / duration)
      setProgress(remaining * 100)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        handleDismiss()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function handleDismiss() {
    if (dismissedRef.current) return
    dismissedRef.current = true
    cancelAnimationFrame(rafRef.current)
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  function handleUndo() {
    if (dismissedRef.current) return
    dismissedRef.current = true
    cancelAnimationFrame(rafRef.current)
    setVisible(false)
    setTimeout(onUndo, 300)
  }

  const seconds = Math.ceil((progress / 100) * (duration / 1000))

  return (
    <div
      style={{
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease',
      }}
    >
      <div
        className="relative flex items-center rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: 360,
        }}
      >
        {/* Progress bar — top, uses theme accent */}
        <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: 'var(--color-accent)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Icon */}
        <div className="pl-4 pr-3 py-3.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-light)' }}
          >
            <Trash2 size={15} style={{ color: 'var(--color-accent-text)' }} />
          </div>
        </div>

        {/* Text */}
        <p className="text-sm font-medium flex-1 py-3.5" style={{ color: 'var(--color-text-primary)' }}>
          {message}
        </p>

        {/* Timer badge — theme accent */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mx-3"
          style={{
            background: 'var(--color-accent-light)',
            color: 'var(--color-accent-text)',
            minWidth: 28,
            textAlign: 'center',
          }}
        >
          {seconds}s
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* Undo button */}
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-4 py-3.5 font-semibold transition-opacity hover:opacity-70 shrink-0"
          style={{ fontSize: '13px', color: 'var(--color-accent-text)' }}
        >
          <RotateCcw size={13} />
          Deshacer
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="px-3 py-3.5 transition-opacity hover:opacity-60 shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
