import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode | ((animatedClose: () => void) => ReactNode)
}

export function Modal({ onClose, children }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClose() {
    if (timerRef.current) return // already closing
    setVisible(false)
    timerRef.current = setTimeout(onClose, 220)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background 0.22s ease, backdrop-filter 0.22s ease',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.96) translateY(12px)',
          transition: 'opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {typeof children === 'function' ? (children as (close: () => void) => ReactNode)(handleClose) : children}
      </div>
    </div>
  )
}
