import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Briefcase, FileText, Settings } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

const links = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard',    to: '/dashboard' },
  { icon: Briefcase,       labelKey: 'nav.applications', to: '/applications' },
  { icon: FileText,        labelKey: 'nav.documents',    to: '/cv' },
  { icon: Settings,        labelKey: 'nav.settings',     to: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { t } = useLang()
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [indicator, setIndicator] = useState({ top: 0, height: 0, opacity: 0 })
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const activeIdx = links.findIndex((l) => location.pathname.startsWith(l.to))

  useEffect(() => {
    const el = itemRefs.current[activeIdx]
    const nav = navRef.current
    if (!el || !nav) return
    const navTop = nav.getBoundingClientRect().top
    const elRect = el.getBoundingClientRect()
    setIndicator({ top: elRect.top - navTop, height: elRect.height, opacity: 1 })
  }, [activeIdx, location.pathname])

  return (
    <aside
      className="flex flex-col h-full w-[230px] shrink-0"
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: 64, borderBottom: '1px solid var(--color-border)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-accent)', boxShadow: '0 4px 12px var(--color-accent-border)' }}
        >
          <Briefcase size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <p className="font-black tracking-widest uppercase leading-none" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: 'var(--color-accent-text)' }}>
          TRACKBOOK
        </p>
      </div>

      {/* ── Nav label ── */}
      <p className="px-5 pt-5 pb-2 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', opacity: 0.45 }}>
        {t('sidebar.menu')}
      </p>

      {/* ── Nav ── */}
      <div ref={navRef} className="relative flex flex-col gap-0.5 px-3 flex-1">

        {/* Sliding indicator */}
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: indicator.top,
            height: indicator.height,
            borderRadius: 12,
            background: 'var(--color-accent-light)',
            border: '1px solid var(--color-accent-border)',
            opacity: indicator.opacity,
            transition: 'top 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {links.map(({ icon: Icon, labelKey, to }, idx) => {
          const isActive = activeIdx === idx
          const isHovered = hoveredIdx === idx

          return (
            <NavLink
              key={to}
              to={to}
              ref={(el) => { itemRefs.current[idx] = el }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative flex items-center gap-3 px-3 py-2.5 text-sm text-left w-full"
              style={{
                zIndex: 1,
                borderRadius: 12,
                color: isActive ? 'var(--color-accent-text)' : isHovered ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: isHovered && !isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
            >
              {/* Icon box */}
              <span
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 30,
                  height: 30,
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  transition: 'background 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 12px var(--color-accent-border)' : 'none',
                }}
              >
                <Icon size={20} color={isActive ? '#fff' : undefined} strokeWidth={isActive ? 2.25 : 1.75} />
              </span>

              {/* Label */}
              <span
                style={{
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  transition: 'transform 0.18s ease',
                  transform: isActive ? 'translateX(1px)' : 'translateX(0)',
                }}
              >
                {t(labelKey)}
              </span>

              {/* Active dot */}
              {isActive && (
                <span
                  className="ml-auto rounded-full"
                  style={{ width: 6, height: 6, background: 'var(--color-accent)', boxShadow: '0 0 6px var(--color-accent)', flexShrink: 0 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>

      {/* ── Version ── */}
      <div className="px-5 pb-4 pt-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
          v{__APP_VERSION__}
        </p>
      </div>
    </aside>
  )
}
