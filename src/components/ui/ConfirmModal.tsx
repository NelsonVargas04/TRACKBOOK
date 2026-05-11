import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Props {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({ title, description, confirmLabel = 'Eliminar', onConfirm, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 240)
  }

  function handleConfirm() {
    setVisible(false)
    setTimeout(() => { onConfirm(); onClose() }, 240)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 0.24s ease, backdrop-filter 0.24s ease',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.92) translateY(20px)',
          transition: 'opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div
          className="w-[440px] rounded-3xl flex flex-col overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Accent top line */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
          />

          {/* Icon area */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8">
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center mb-6">
              <div
                className="absolute rounded-full"
                style={{
                  width: 80, height: 80,
                  background: 'var(--color-accent-light)',
                  animation: 'ping-slow 2s ease-out infinite',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 64, height: 64,
                  background: 'var(--color-accent-light)',
                }}
              />
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'var(--color-accent-light)',
                  border: '1px solid var(--color-accent-border)',
                  boxShadow: '0 8px 24px var(--color-accent-border)',
                }}
              >
                <Trash2 size={24} style={{ color: 'var(--color-accent-text)' }} />
              </div>
            </div>

            <h2
              className="text-xl font-black text-center mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              {title}
            </h2>
            <p
              className="text-sm text-center leading-relaxed"
              style={{ color: 'var(--color-text-muted)', maxWidth: 300 }}
            >
              {description}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 24px' }} />

          {/* Actions */}
          <div className="flex gap-3 px-6 py-5">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-2xl font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{
                fontSize: '14px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                fontSize: '14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(239,68,68,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,68,68,0.4)')}
            >
              <Trash2 size={15} />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
