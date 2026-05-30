import { useState, useEffect, useMemo, useRef } from 'react'
import { LayoutGrid, List, Plus, Search, X, Star, ChevronDown } from 'lucide-react'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import Header from '@/pages/Dashboard/components/Header'
import { ListView } from './components/ListView'
import { BoardView } from './components/BoardView'
import { NewApplicationModal } from './components/NewApplicationModal'
import { ApplicationModal } from './components/ApplicationModal'
import { SuccessToast } from '@/components/ui/SuccessToast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useClickOutside } from '@/hooks/useClickOutside'
import { getApplications, createApplication, updateApplication } from '@/services/applications.service'
import { useLang } from '@/context/LanguageContext'
import type { Application, Status } from '@/data/mockApplications'

const ALL_STATUSES: Status[] = ['Aplicada', 'En Proceso', 'Screening', 'Entrevista', 'Oferta', 'Ghosteado', 'Rechazada']

function dbRowToApp(row: any): Application {
  return {
    id: row.id,
    role: row.role,
    company: row.company,
    date: new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : undefined,
    status: row.status,
    stars: row.stars,
    type: row.type,
    salary: row.salary ?? undefined,
    note: row.note ?? undefined,
    contact: row.contact ?? undefined,
    tag: row.tag ?? undefined,
    url: row.url ?? undefined,
    source: row.source ?? undefined,
    cvId: row.cv_id ?? undefined,
    coverLetterId: row.cover_letter_id ?? undefined,
    icon: '',
    activity: row.activity_entries?.map((e: any) => ({
      id: e.id,
      date: e.date ?? e.created_at.slice(0, 10),
      label: e.label,
      note: e.note ?? undefined,
    })) ?? [],
  }
}

export default function ApplicationsPage() {
  const { t } = useLang()
  const [view, setView] = useState<'list' | 'board'>('list')
  const [showModal, setShowModal] = useState(false)
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selected, setSelected] = useState<Application | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status[]>([])
  const [minStars, setMinStars] = useState(0)
  const [statusOpen, setStatusOpen] = useState(false)
  const [starsOpen, setStarsOpen] = useState(false)
  const statusFilterRef = useRef<HTMLDivElement>(null)
  const starsFilterRef = useRef<HTMLDivElement>(null)
  useClickOutside(statusFilterRef, () => setStatusOpen(false))
  useClickOutside(starsFilterRef, () => setStarsOpen(false))

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apps.filter((a) => {
      if (q && !a.role.toLowerCase().includes(q) && !a.company.toLowerCase().includes(q)) return false
      if (statusFilter.length > 0 && !statusFilter.includes(a.status)) return false
      if (minStars > 0 && a.stars < minStars) return false
      return true
    })
  }, [apps, search, statusFilter, minStars])

  const hasActiveFilters = search.trim() !== '' || statusFilter.length > 0 || minStars > 0

  function clearFilters() {
    setSearch('')
    setStatusFilter([])
    setMinStars(0)
  }

  useEffect(() => {
    getApplications()
      .then((rows) => setApps(rows.map(dbRowToApp)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(app: Application) {
    setSaving(true)
    try {
      const row = await createApplication({
        role: app.role,
        company: app.company,
        status: app.status,
        stars: app.stars,
        type: app.type,
        salary: app.salary ?? null,
        note: app.note ?? null,
        contact: app.contact ?? null,
        tag: app.tag ?? null,
        url: app.url ?? null,
        source: app.source ?? null,
        cv_id: null,
        cover_letter_id: null,
        updated_at: null,
      })
      setApps((prev) => [dbRowToApp(row), ...prev])
      setShowSuccess(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(updated: Application) {
    const previous = apps.find((a) => a.id === updated.id)
    setApps((prev) => prev.map((a) => a.id === updated.id ? updated : a))
    setSelected(null)

    try {
      await updateApplication(updated.id, {
        role: updated.role,
        company: updated.company,
        status: updated.status,
        stars: updated.stars,
        type: updated.type,
        salary: updated.salary ?? null,
        note: updated.note ?? null,
        contact: updated.contact ?? null,
        tag: updated.tag ?? null,
        url: updated.url ?? null,
        source: updated.source ?? null,
      })
    } catch (e) {
      console.error(e)
      if (previous) {
        setApps((prev) => prev.map((a) => a.id === updated.id ? previous : a))
      }
    }
  }

  async function handleStatusChange(app: Application, newStatus: Application['status']) {
    const previous = app
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    const optimistic = { ...app, status: newStatus, updatedAt: now }
    setApps((prev) => prev.map((a) => a.id === app.id ? optimistic : a))

    try {
      await updateApplication(app.id, { status: newStatus })
    } catch (e) {
      console.error(e)
      setApps((prev) => prev.map((a) => a.id === app.id ? previous : a))
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 z-[60]" style={{ transform: 'translateX(-50%)' }}>
          <SuccessToast message={t('apps.addSuccess')} onDismiss={() => setShowSuccess(false)} />
        </div>
      )}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                {t('apps.title')}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('apps.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center p-1 rounded-xl gap-1"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {(['list', 'board'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: view === v ? 'var(--color-accent)' : 'transparent',
                      color: view === v ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {v === 'list' ? <List size={14} /> : <LayoutGrid size={14} />}
                    {v === 'list' ? t('apps.list') : t('apps.board')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-accent)' }}
              >
                <Plus size={14} />
                {t('apps.new')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* Filters bar */}
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                {/* Search */}
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl flex-1 min-w-[280px]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('filters.searchPlaceholder')}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <div ref={statusFilterRef} className="relative">
                  <button
                    onClick={() => setStatusOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                    style={{
                      fontSize: '14px',
                      background: statusFilter.length > 0 ? 'var(--color-accent-light)' : 'var(--color-surface)',
                      border: `1px solid ${statusFilter.length > 0 ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                      color: statusFilter.length > 0 ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                    }}
                  >
                    <span className="font-medium">{t('filters.status')}</span>
                    {statusFilter.length > 0 && (
                      <span
                        className="px-1.5 rounded-full text-[11px] font-bold tabular-nums"
                        style={{ background: 'var(--color-accent)', color: '#fff' }}
                      >
                        {statusFilter.length}
                      </span>
                    )}
                    <ChevronDown size={13} style={{ transform: statusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {statusOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-20"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        minWidth: 180,
                      }}
                    >
                      {ALL_STATUSES.map((s) => {
                        const active = statusFilter.includes(s)
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusFilter((prev) => active ? prev.filter((x) => x !== s) : [...prev, s])}
                            className="flex items-center justify-between gap-2 w-full px-3 py-2 transition-all hover:brightness-110"
                            style={{ background: active ? 'var(--color-accent-light)' : 'transparent' }}
                          >
                            <StatusBadge status={s} />
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                              style={{
                                background: active ? 'var(--color-accent)' : 'transparent',
                                border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              }}
                            >
                              {active && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                  <polyline points="20,6 9,17 4,12" />
                                </svg>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Stars filter */}
                <div ref={starsFilterRef} className="relative">
                  <button
                    onClick={() => setStarsOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                    style={{
                      fontSize: '14px',
                      background: minStars > 0 ? 'var(--color-accent-light)' : 'var(--color-surface)',
                      border: `1px solid ${minStars > 0 ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                      color: minStars > 0 ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                    }}
                  >
                    <Star size={14} style={{ fill: minStars > 0 ? '#f59e0b' : 'none', color: minStars > 0 ? '#f59e0b' : 'currentColor' }} />
                    <span className="font-medium">{minStars > 0 ? `${minStars}+` : t('filters.relevance')}</span>
                    <ChevronDown size={13} style={{ transform: starsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {starsOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 flex flex-col"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        width: 220,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => {
                        const active = minStars === n
                        return (
                          <button
                            key={n}
                            onClick={() => { setMinStars(n); setStarsOpen(false) }}
                            className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-all hover:brightness-110"
                            style={{
                              background: active ? 'var(--color-accent-light)' : 'transparent',
                              color: active ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                            }}
                          >
                            <span className="font-medium whitespace-nowrap">
                              {n === 0 ? t('filters.anyStars') : `${n}+ ${n === 1 ? t('filters.star') : t('filters.stars')}`}
                            </span>
                            {n > 0 && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                {[...Array(n)].map((_, i) => (
                                  <Star key={i} size={13} fill="#f59e0b" stroke="none" />
                                ))}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={13} />
                    {t('filters.clear')}
                  </button>
                )}
              </div>

              {filteredApps.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-xl gap-2.5"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <Search size={32} strokeWidth={1.25} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {hasActiveFilters ? t('filters.noResults') : t('apps.empty')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold mt-1 transition-opacity hover:opacity-80"
                      style={{ color: 'var(--color-accent-text)' }}
                    >
                      {t('filters.clear')}
                    </button>
                  )}
                </div>
              ) : view === 'list'
                ? <ListView apps={filteredApps} onSelect={setSelected} />
                : <BoardView apps={filteredApps} onSelect={setSelected} onStatusChange={handleStatusChange} />
              }
            </>
          )}
        </main>
      </div>

      {showModal && (
        <NewApplicationModal
          onClose={() => { if (!saving) setShowModal(false) }}
          onAdd={async (app) => { await handleAdd(app); setShowModal(false) }}
          loading={saving}
        />
      )}
      {selected && (
        <ApplicationModal
          app={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
