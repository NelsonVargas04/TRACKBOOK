import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Star, Trash2, FileText } from 'lucide-react'
import { useCV } from '@/context/CVContext'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import { useLang } from '@/context/LanguageContext'

export default function CVDetailPage() {
  const { cvCode } = useParams<{ cvCode: string }>()
  const navigate = useNavigate()
  const { t } = useLang()
  const { cvs, primaryId, setPrimaryId, setCVs } = useCV()

  const cv = cvs.find((c) => c.cvCode === cvCode)
  const isPrimary = cv ? primaryId === cv.id : false

  function handleDelete() {
    if (!cv) return
    setCVs((prev) => prev.filter((c) => c.id !== cv.id))
    if (primaryId === cv.id) setPrimaryId(null)
    navigate('/cv')
  }

  if (!cv) {
    return (
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col items-center justify-center gap-4">
            <FileText size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('detail.notFound')}</p>
            <button
              onClick={() => navigate('/cv')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              <ArrowLeft size={14} /> {t('detail.backToCVs')}
            </button>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-8 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cv')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-70"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <ArrowLeft size={14} />
                {t('detail.back')}
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-accent-light)' }}
                >
                  <FileText size={15} style={{ color: 'var(--color-accent-text)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                      {cv.name}
                    </h1>
                    {isPrimary && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                      >
                        {t('cv.primary')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {cv.cvCode} · {cv.date} · {cv.size}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrimaryId(isPrimary ? null : cv.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: isPrimary ? 'rgba(245,158,11,0.12)' : 'var(--color-bg)',
                  border: `1px solid ${isPrimary ? 'rgba(245,158,11,0.4)' : 'var(--color-border)'}`,
                  color: isPrimary ? '#f59e0b' : 'var(--color-text-muted)',
                }}
              >
                <Star size={14} fill={isPrimary ? '#f59e0b' : 'none'} />
                {isPrimary ? t('cv.primary') : t('detail.markPrimary')}
              </button>

              {cv.url && (
                <a
                  href={cv.url}
                  download={cv.name + '.pdf'}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  <Download size={14} />
                  {t('detail.download')}
                </a>
              )}

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                <Trash2 size={14} />
                {t('detail.delete')}
              </button>
            </div>
          </div>

          {/* PDF viewer */}
          <div className="flex-1 overflow-hidden">
            {cv.url ? (
              <iframe
                src={cv.url}
                className="w-full h-full"
                title={cv.name}
                style={{ background: '#fff' }}
              />
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-bg)' }}>
                <FileText size={56} style={{ color: 'var(--color-accent-text)', opacity: 0.2 }} />
                <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {t('detail.noPreview')}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('detail.uploadPDF')}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
