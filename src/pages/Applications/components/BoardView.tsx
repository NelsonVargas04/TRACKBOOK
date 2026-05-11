import { useRef, useState } from 'react'
import { Stars } from '@/components/ui/Stars'
import { useLang } from '@/context/LanguageContext'
import type { Application, Status } from '@/data/mockApplications'

const STATUS_KEYS: { status: Status; dot: string; labelKey: string }[] = [
  { status: 'Aplicada',   dot: '#94a3b8', labelKey: 'status.applied'   },
  { status: 'Screening',  dot: '#a78bfa', labelKey: 'status.screening' },
  { status: 'Entrevista', dot: '#f59e0b', labelKey: 'status.interview' },
  { status: 'Oferta',     dot: '#22c55e', labelKey: 'status.offer'     },
  { status: 'Rechazada',  dot: '#ef4444', labelKey: 'status.rejected'  },
]

interface Props {
  apps: Application[]
  onSelect?: (app: Application) => void
  onStatusChange?: (app: Application, newStatus: Status) => void
}

export function BoardView({ apps, onSelect, onStatusChange }: Props) {
  const { t } = useLang()
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [overStatus, setOverStatus] = useState<Status | null>(null)
  const dragApp = useRef<Application | null>(null)

  function handleDragStart(e: React.DragEvent, app: Application) {
    dragApp.current = app
    setDraggingId(app.id)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.position = 'absolute'
    ghost.style.top = '-9999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverStatus(null)
    dragApp.current = null
  }

  function handleDrop(status: Status) {
    const app = dragApp.current
    setDraggingId(null)
    setOverStatus(null)
    dragApp.current = null
    if (!app || app.status === status) return
    onStatusChange?.(app, status)
  }

  return (
    <div className="flex gap-4 h-full pb-4">
      {STATUS_KEYS.map(({ status, dot, labelKey }) => {
        const colApps = apps.filter((a) => a.status === status)
        const isOver = overStatus === status && draggingId !== null
        const isDraggingHere = colApps.some((a) => a.id === draggingId)

        return (
          <div
            key={status}
            className="flex flex-col gap-3 rounded-2xl transition-all duration-150"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 120,
              background: isOver ? dot + '18' : 'transparent',
              border: isOver ? `2px dashed ${dot}` : '2px solid transparent',
              padding: '4px',
              boxSizing: 'border-box',
            }}
            onDragOver={(e) => { e.preventDefault(); setOverStatus(status) }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverStatus(null)
              }
            }}
            onDrop={(e) => { e.preventDefault(); handleDrop(status) }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 py-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {t(labelKey)}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: dot + '20', color: dot }}
              >
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5">
              {colApps.map((app) => {
                const isDragging = draggingId === app.id
                return (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (!isDragging) onSelect?.(app) }}
                    className="rounded-xl p-4 flex flex-col gap-3 select-none transition-all duration-150"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: isDragging ? `0 12px 32px rgba(0,0,0,0.5)` : '0 1px 3px rgba(0,0,0,0.15)',
                      opacity: isDragging ? 0.5 : 1,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      transform: isDragging ? 'scale(0.97)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.borderColor = dot + '60' }}
                    onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                        style={{
                          background: 'var(--color-accent-light)',
                          color: 'var(--color-accent-text)',
                          border: '1px solid var(--color-accent-border)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {app.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)' }}
                      >
                        {app.type}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                        {app.role}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {app.company}
                      </p>
                    </div>

                    {app.salary && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('apps.salary')}</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--color-accent-text)' }}>
                          {app.salary}
                        </span>
                      </div>
                    )}

                    {app.tag && (
                      <span
                        className="self-start text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                      >
                        {app.tag}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <Stars count={app.stars} />
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {app.date}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Ghost preview in target column */}
              {isOver && !isDraggingHere && dragApp.current && (() => {
                const ghost = dragApp.current!
                return (
                  <div
                    className="rounded-xl p-4 flex flex-col gap-3 pointer-events-none"
                    style={{
                      background: 'var(--color-surface)',
                      border: `2px dashed ${dot}`,
                      opacity: 0.5,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                        style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)' }}
                      >
                        {ghost.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)' }}>
                        {ghost.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{ghost.role}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{ghost.company}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <Stars count={ghost.stars} />
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{ghost.date}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
