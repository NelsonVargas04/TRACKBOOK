import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2, Star, Pencil, ScrollText } from 'lucide-react'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import Header from '@/pages/Dashboard/components/Header'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { UndoToast } from '@/components/ui/UndoToast'
import { SuccessToast } from '@/components/ui/SuccessToast'
import { UploadModal } from './components/UploadModal'
import { CoverLetterModal } from './components/CoverLetterModal'
import { useCV, genCode } from '@/context/CVContext'
import { useCoverLetter, genCLCode } from '@/context/CoverLetterContext'
import type { CV } from '@/context/CVContext'
import type { CoverLetter } from '@/context/CoverLetterContext'
import { createCV, deleteCV as deleteCVService, setPrimaryCV } from '@/services/cvs.service'
import { createCoverLetter, updateCoverLetter, deleteCoverLetter as deleteCLService, setPrimaryCoverLetter } from '@/services/coverLetters.service'
import { usePagination } from '@/hooks/usePagination'
import { useLang } from '@/context/LanguageContext'

const PER_PAGE = 8

type Tab = 'cv' | 'cl'

interface Toast {
  id: number
  message: string
  onUndo: () => void
}

export default function CVPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>('cv')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const toastId = useRef(0)
  const [confirmCV, setConfirmCV] = useState<CV | null>(null)
  const [confirmCL, setConfirmCL] = useState<CoverLetter | null>(null)

  // ── CV state ──────────────────────────────────────────
  const { cvs, loading: cvsLoading, setCVs, primaryId, setPrimaryId, reload: reloadCVs } = useCV()
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)

  const sortedCVs = [...cvs].sort((a, b) => {
    if (a.id === primaryId) return -1
    if (b.id === primaryId) return 1
    return 0
  })
  const cvPagination = usePagination(sortedCVs.length, PER_PAGE)
  const paginatedCVs = cvPagination.slice(sortedCVs)

  async function addCV(file: File, markAsPrimary: boolean) {
    setUploading(true)
    try {
      const sizeKB = Math.round(file.size / 1024)
      const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`
      const name = file.name.replace(/\.pdf$/i, '')
      const totalAfter = cvs.length + 1
      const cv_code = genCode(totalAfter)
      const row = await createCV({ cv_code, name, size, is_primary: markAsPrimary }, file)
      if (markAsPrimary) {
        await setPrimaryCV(row.id)
        setPrimaryId(row.id)
      }
      await reloadCVs()
      setSuccessMsg(t('cv.uploadSuccess'))
    } catch (e) {
      console.error('Error subiendo CV:', e)
    } finally {
      setUploading(false)
    }
  }

  async function confirmDeleteCV(cv: CV) {
    setCVs((prev) => prev.filter((c) => c.id !== cv.id))
    const wasP = primaryId === cv.id
    if (wasP) setPrimaryId(null)

    let undone = false
    const id = toastId.current++
    setToasts((prev) => [
      ...prev,
      {
        id,
        message: `${t('cv.toastCV')} "${cv.name}"`,
        onUndo: () => {
          undone = true
          setCVs((prev) => {
            if (prev.find((c) => c.id === cv.id)) return prev
            return [...prev, cv]
          })
          if (wasP) setPrimaryId(cv.id)
        },
      },
    ])

    await new Promise((r) => setTimeout(r, 4000))
    if (!undone) {
      deleteCVService(cv.id).catch(console.error)
    }
  }

  // ── Cover Letter state ────────────────────────────────
  const { coverLetters, loading: clsLoading, setCoverLetters, primaryCLId, setPrimaryCLId, reload: reloadCLs } = useCoverLetter()
  const [showCLModal, setShowCLModal] = useState(false)
  const [editingCL, setEditingCL] = useState<CoverLetter | undefined>()
  const [savingCL, setSavingCL] = useState(false)

  const sortedCLs = [...coverLetters].sort((a, b) => {
    if (a.id === primaryCLId) return -1
    if (b.id === primaryCLId) return 1
    return 0
  })
  const clPagination = usePagination(sortedCLs.length, PER_PAGE)
  const paginatedCLs = clPagination.slice(sortedCLs)

  async function saveCoverLetter(name: string, content: string, markAsPrimary: boolean) {
    setSavingCL(true)
    try {
      const preview = content.slice(0, 120) + (content.length > 120 ? '…' : '')
      if (editingCL) {
        await updateCoverLetter(editingCL.id, { name, content, preview })
        if (markAsPrimary) await setPrimaryCoverLetter(editingCL.id)
      } else {
        const totalAfter = coverLetters.length + 1
        const row = await createCoverLetter({ cl_code: genCLCode(totalAfter), name, content, preview, is_primary: markAsPrimary })
        if (markAsPrimary) await setPrimaryCoverLetter(row.id)
      }
      await reloadCLs()
      setSuccessMsg(t('cv.clSaveSuccess'))
    } catch (e) {
      console.error('Error guardando carta:', e)
    } finally {
      setSavingCL(false)
      setEditingCL(undefined)
    }
  }

  async function confirmDeleteCL(cl: CoverLetter) {
    setCoverLetters((prev) => prev.filter((c) => c.id !== cl.id))
    const wasP = primaryCLId === cl.id
    if (wasP) setPrimaryCLId(null)

    let undone = false
    const id = toastId.current++
    setToasts((prev) => [
      ...prev,
      {
        id,
        message: `${t('cv.toastCL')} "${cl.name}"`,
        onUndo: () => {
          undone = true
          setCoverLetters((prev) => {
            if (prev.find((c) => c.id === cl.id)) return prev
            return [...prev, cl]
          })
          if (wasP) setPrimaryCLId(cl.id)
        },
      },
    ])

    await new Promise((r) => setTimeout(r, 4000))
    if (!undone) {
      deleteCLService(cl.id).catch(console.error)
    }
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  function openEditCL(cl: CoverLetter) {
    setEditingCL(cl)
    setShowCLModal(true)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-hidden flex flex-col px-8 py-6">

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                {t('cv.title')}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('cv.subtitle')}
              </p>
            </div>
            <button
              onClick={() => tab === 'cv' ? setShowUpload(true) : setShowCLModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-accent)' }}
            >
              <Plus size={16} />
              {tab === 'cv' ? t('cv.addCV') : t('cv.newCL')}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {([
              { id: 'cv', icon: FileText, labelKey: 'cv.tabCV', count: cvs.length },
              { id: 'cl', icon: ScrollText, labelKey: 'cv.tabCL', count: coverLetters.length },
            ] as const).map(({ id, icon: Icon, labelKey, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === id ? 'var(--color-accent)' : 'transparent',
                  color: tab === id ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                <Icon size={15} />
                {t(labelKey)}
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: tab === id ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-light)',
                    color: tab === id ? '#fff' : 'var(--color-accent-text)',
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* ── CV TAB ─────────────────────────────────── */}
          {tab === 'cv' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                {/* Header */}
                <div
                  className="grid items-center px-6 py-4"
                  style={{
                    gridTemplateColumns: '44px 120px 1fr 150px 110px 64px',
                    background: 'var(--color-bg)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {[t('cv.colStar'), t('cv.colId'), t('cv.colName'), t('cv.colDate'), t('cv.colSize'), ''].map((h, i) => (
                    <span key={i} className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>{h}</span>
                  ))}
                </div>

                {cvsLoading ? (
                  <CVSkeleton />
                ) : cvs.length === 0 ? (
                  <EmptyState icon={FileText} label={t('cv.emptyCVs')} onAdd={() => setShowUpload(true)} cta={t('cv.addFirst')} />
                ) : (
                  paginatedCVs.map((cv) => {
                    const isPrimary = primaryId === cv.id
                    return (
                      <div
                        key={cv.id}
                        className="grid items-center px-6 cursor-pointer transition-colors"
                        style={{
                          gridTemplateColumns: '44px 120px 1fr 150px 110px 64px',
                          minHeight: 72,
                          background: 'var(--color-surface)',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                        onClick={() => navigate(`/cv/${cv.cvCode}`)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setPrimaryId(isPrimary ? null : cv.id)} className="p-1 rounded-lg transition-all hover:scale-110">
                            <Star size={17} fill={isPrimary ? '#f59e0b' : 'none'} style={{ color: isPrimary ? '#f59e0b' : 'var(--color-text-muted)' }} />
                          </button>
                        </div>
                        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--color-accent-text)' }}>{cv.cvCode}</span>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                            <FileText size={15} style={{ color: 'var(--color-accent-text)' }} />
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[15px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{cv.name}</span>
                            {isPrimary && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                {t('cv.primary')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{cv.date}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg w-fit" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)' }}>
                          {cv.size}
                        </span>
                        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setConfirmCV(cv)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}

                {cvs.length > 0 && (
                  <Pagination page={cvPagination.page} totalPages={cvPagination.totalPages} onPageChange={cvPagination.setPage} label={`${t('cv.page')} ${cvPagination.page} ${t('cv.pageOf')} ${cvPagination.totalPages}`} />
                )}
              </div>
            </div>
          )}

          {/* ── COVER LETTER TAB ───────────────────────── */}
          {tab === 'cl' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                {/* Header */}
                <div
                  className="grid items-center px-6 py-4"
                  style={{
                    gridTemplateColumns: '44px 120px 1fr 150px 80px',
                    background: 'var(--color-bg)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {[t('cv.colStar'), t('cv.colId'), t('cv.colNamePreview'), t('cv.colDate'), ''].map((h, i) => (
                    <span key={i} className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>{h}</span>
                  ))}
                </div>

                {clsLoading ? (
                  <CLSkeleton />
                ) : coverLetters.length === 0 ? (
                  <EmptyState icon={ScrollText} label={t('cv.emptyCLs')} onAdd={() => setShowCLModal(true)} cta={t('cv.createFirst')} />
                ) : (
                  paginatedCLs.map((cl) => {
                    const isPrimary = primaryCLId === cl.id
                    return (
                      <div
                        key={cl.id}
                        className="grid items-center px-6 cursor-pointer transition-colors"
                        style={{
                          gridTemplateColumns: '44px 120px 1fr 150px 80px',
                          minHeight: 72,
                          background: 'var(--color-surface)',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                        onClick={() => openEditCL(cl)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setPrimaryCLId(isPrimary ? null : cl.id)} className="p-1 rounded-lg transition-all hover:scale-110">
                            <Star size={17} fill={isPrimary ? '#f59e0b' : 'none'} style={{ color: isPrimary ? '#f59e0b' : 'var(--color-text-muted)' }} />
                          </button>
                        </div>
                        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--color-accent-text)' }}>{cl.clCode}</span>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                            <ScrollText size={15} style={{ color: 'var(--color-accent-text)' }} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold truncate leading-snug" style={{ color: 'var(--color-text-primary)' }}>{cl.name}</span>
                              {isPrimary && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                  {t('cv.primary')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{cl.preview}</p>
                          </div>
                        </div>
                        <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{cl.date}</span>
                        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditCL(cl)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ color: 'var(--color-accent-text)' }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmCL(cl)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}

                {coverLetters.length > 0 && (
                  <Pagination page={clPagination.page} totalPages={clPagination.totalPages} onPageChange={clPagination.setPage} label={`${t('cv.page')} ${clPagination.page} ${t('cv.pageOf')} ${clPagination.totalPages}`} />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => { if (!uploading) setShowUpload(false) }}
          onAdd={async (file, primary) => { await addCV(file, primary); setShowUpload(false) }}
          loading={uploading}
        />
      )}
      {showCLModal && (
        <CoverLetterModal
          onClose={() => { if (!savingCL) { setShowCLModal(false); setEditingCL(undefined) } }}
          onSave={async (name, content, primary) => { await saveCoverLetter(name, content, primary); setShowCLModal(false) }}
          primaryCLId={primaryCLId}
          editing={editingCL}
          loading={savingCL}
        />
      )}

      {confirmCV && (
        <ConfirmModal
          title={t('cv.deleteCVTitle')}
          description={`"${confirmCV.name}" ${t('cv.deleteCVDesc')}`}
          confirmLabel={t('cv.confirmDelete')}
          onConfirm={() => confirmDeleteCV(confirmCV)}
          onClose={() => setConfirmCV(null)}
        />
      )}
      {confirmCL && (
        <ConfirmModal
          title={t('cv.deleteCLTitle')}
          description={`"${confirmCL.name}" ${t('cv.deleteCLDesc')}`}
          confirmLabel={t('cv.confirmDelete')}
          onConfirm={() => confirmDeleteCL(confirmCL)}
          onClose={() => setConfirmCL(null)}
        />
      )}

      {/* Toasts — stacked bottom-center */}
      <div className="fixed bottom-6 left-1/2 z-[60] flex flex-col gap-2" style={{ transform: 'translateX(-50%)' }}>
        {successMsg && (
          <SuccessToast message={successMsg} onDismiss={() => setSuccessMsg(null)} />
        )}
        {toasts.map((t) => (
          <UndoToast
            key={t.id}
            message={t.message}
            onUndo={t.onUndo}
            onDismiss={() => dismissToast(t.id)}
          />
        ))}
      </div>
    </div>
  )
}

function CVSkeleton() {
  return (
    <div style={{ background: 'var(--color-surface)' }}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="grid items-center px-6 animate-pulse"
          style={{
            gridTemplateColumns: '44px 120px 1fr 150px 110px 64px',
            minHeight: 72,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="w-5 h-5 rounded-full" style={{ background: 'var(--color-bg)' }} />
          <div className="h-3 rounded-full w-20" style={{ background: 'var(--color-bg)' }} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'var(--color-bg)' }} />
            <div className="h-3 rounded-full w-40" style={{ background: 'var(--color-bg)' }} />
          </div>
          <div className="h-3 rounded-full w-24" style={{ background: 'var(--color-bg)' }} />
          <div className="h-6 rounded-lg w-16" style={{ background: 'var(--color-bg)' }} />
          <div />
        </div>
      ))}
    </div>
  )
}

function CLSkeleton() {
  return (
    <div style={{ background: 'var(--color-surface)' }}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="grid items-center px-6 animate-pulse"
          style={{
            gridTemplateColumns: '44px 120px 1fr 150px 80px',
            minHeight: 72,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="w-5 h-5 rounded-full" style={{ background: 'var(--color-bg)' }} />
          <div className="h-3 rounded-full w-20" style={{ background: 'var(--color-bg)' }} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'var(--color-bg)' }} />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 rounded-full w-36" style={{ background: 'var(--color-bg)' }} />
              <div className="h-2.5 rounded-full w-52" style={{ background: 'var(--color-bg)' }} />
            </div>
          </div>
          <div className="h-3 rounded-full w-24" style={{ background: 'var(--color-bg)' }} />
          <div />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, label, onAdd, cta }: {
  icon: React.ElementType
  label: string
  onAdd: () => void
  cta: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ background: 'var(--color-surface)' }}>
      <Icon size={32} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <button
        onClick={onAdd}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)' }}
      >
        {cta}
      </button>
    </div>
  )
}
