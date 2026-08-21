import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useClickOutside } from '@/hooks/useClickOutside'

export default function Header() {
  const { lang, setLang, t } = useLang()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false))

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string) ?? user?.email ?? ''
  const role = (user?.user_metadata?.role as string) ?? ''
  const initials = name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="flex items-center justify-end gap-4 px-8 shrink-0 sticky top-0 z-30"
      style={{
        height: 64,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Language toggle */}
      <div
        className="flex items-center rounded-xl p-1"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', gap: 2 }}
      >
        {(['es', 'en'] as const).map((l) => {
          const active = lang === l
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="rounded-lg font-semibold transition-all"
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: active ? 'var(--color-accent)' : 'transparent',
                color: active ? '#fff' : 'var(--color-text-muted)',
                boxShadow: active ? '0 2px 8px var(--color-accent-border)' : 'none',
                transition: 'background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
              }}
            >
              {l}
            </button>
          )
        })}
      </div>

      {/* Avatar + dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: 'var(--color-accent-light)',
            border: `2px solid ${open ? 'var(--color-accent)' : 'var(--color-accent-border)'}`,
            color: 'var(--color-accent-text)',
            boxShadow: open ? '0 0 0 3px var(--color-accent-border)' : 'none',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          }}
        >
          {avatarUrl
            ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : initials
          }
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 z-50"
            style={{
              width: 240,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
              overflow: 'hidden',
            }}
          >
            {/* User header */}
            <div
              className="flex flex-col items-center gap-2 px-5 py-5"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-bg) 100%)', borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-lg font-black shrink-0"
                style={{ background: 'var(--color-accent-light)', border: '2.5px solid var(--color-accent)', color: 'var(--color-accent-text)', boxShadow: '0 4px 16px var(--color-accent-border)' }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : initials
                }
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {name || 'Usuario'}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {role || user?.email || ''}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 flex flex-col gap-0.5">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-light)'
                  e.currentTarget.style.color = 'var(--color-accent-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                <span className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.05)' }}>
                  <Settings size={13} />
                </span>
                {t('nav.settings')}
              </Link>

              <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 0' }} />

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                <span className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.05)' }}>
                  <LogOut size={13} />
                </span>
                {t('sidebar.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
