import { useEffect, useRef, useState } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { parseFile, importApplications, type ImportRow } from '@/services/import.service'
import { useLang } from '@/context/LanguageContext'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Aplicada:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  Screening:  { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc' },
  Entrevista: { bg: 'rgba(234,179,8,0.15)',   color: '#facc15' },
  Oferta:     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  Rechazada:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
}

interface Props {
  onClose: () => void
  onDone: () => void
}

export function ImportModal({ onClose, onDone }: Props) {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [rows, setRows] = useState<ImportRow[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState<number | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  async function handleFile(file: File) {
    setParseError(null)
    setRows(null)
    try {
      const parsed = await parseFile(file)
      if (parsed.length === 0) { setParseError(t('import.noRows')); return }
      setRows(parsed)
    } catch {
      setParseError(t('import.parseError'))
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  async function handleImport() {
    if (!rows) return
    setImporting(true)
    setImportError(null)
    try {
      const count = await importApplications(rows, (done, total) => {
        setProgress(Math.round((done / total) * 100))
      })
      setImported(count)
    } catch (err: any) {
      setImportError(err.message ?? 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(10px)' : 'blur(0px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={imported !== null ? () => { onDone(); close() } : close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
          transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          width: rows ? 860 : 520,
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            maxHeight: '90vh',
          }}
        >
          {/* Top accent */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)', flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                <FileSpreadsheet size={20} style={{ color: 'var(--color-accent-text)' }} />
              </div>
              <div>
                <h2 className="font-black text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                  {t('import.title')}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {t('import.subtitle')}
                </p>
              </div>
            </div>
            <button onClick={close} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-70" style={{ background: 'var(--color-bg)' }}>
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '0 28px', flexShrink: 0 }} />

          {/* Content */}
          <div className="px-7 py-5 overflow-y-auto flex-1">

            {/* SUCCESS */}
            {imported !== null && (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle size={32} style={{ color: '#22c55e' }} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope' }}>
                    {imported} {t('import.success')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {t('import.successSub')}
                  </p>
                </div>
                <button
                  onClick={() => { onDone(); close() }}
                  className="mt-2 px-8 py-3 rounded-2xl font-bold text-white"
                  style={{ background: 'var(--color-accent)' }}
                >
                  {t('import.goToApps')}
                </button>
              </div>
            )}

            {/* UPLOAD */}
            {imported === null && !rows && (
              <>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileInput} />
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className="flex flex-col items-center justify-center gap-4 rounded-2xl cursor-pointer transition-all"
                  style={{
                    padding: '48px 32px',
                    border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: dragging ? 'var(--color-accent-light)' : 'var(--color-bg)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                    <Upload size={24} style={{ color: 'var(--color-accent-text)' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {t('import.dragDrop')}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {t('import.orClick')}
                    </p>
                  </div>
                </div>

                {parseError && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <p className="text-sm" style={{ color: '#ef4444' }}>{parseError}</p>
                  </div>
                )}

                <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{t('import.columnsTitle')}</p>
                  <div className="flex flex-wrap gap-2">
                    {['Company', 'Position', 'Platform → Source', 'Apply Date', 'Link', 'Recruiter Name', 'Recruiter Email', 'Status', 'Next Action'].map(c => (
                      <span key={c} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* PREVIEW */}
            {imported === null && rows && !importing && (
              <>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <CheckCircle size={18} style={{ color: '#22c55e' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                        <span style={{ color: 'var(--color-accent-text)' }}>{rows.length}</span> {t('import.readyCount')}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {t('import.previewHint')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setRows(null); setParseError(null) }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg shrink-0 transition-colors hover:brightness-110"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    <Upload size={13} />
                    {t('import.changeFile')}
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <div style={{ maxHeight: 360, overflow: 'auto' }}>
                    <table className="text-sm" style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 560 }}>
                      <colgroup>
                        <col style={{ width: '46%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '18%' }} />
                      </colgroup>
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 1 }}>
                        <tr>
                          {['Empresa / Puesto', 'Fuente', 'Estado', 'Fecha'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => {
                          const sc = STATUS_COLORS[row.status] ?? STATUS_COLORS.Aplicada
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td className="px-4 py-2.5">
                                <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{row.company}</p>
                                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{row.role}</p>
                              </td>
                              <td className="px-4 py-2.5 text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{row.source}</td>
                              <td className="px-4 py-2.5">
                                <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                {new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {importError && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <p className="text-sm" style={{ color: '#ef4444' }}>{importError}</p>
                  </div>
                )}
              </>
            )}

            {/* IMPORTING */}
            {importing && (
              <div className="flex flex-col items-center py-8 gap-5">
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{t('import.importing')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--color-bg)' }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {imported === null && rows && !importing && (
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
              <div className="flex gap-3">
                <button
                  onClick={close}
                  className="flex-1 py-3 rounded-2xl font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 14 }}
                >
                  {t('import.cancel')}
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--color-accent)', fontSize: 14, boxShadow: '0 4px 16px var(--color-accent-border)' }}
                >
                  <Upload size={15} />
                  {t('import.importBtn')} {rows.length}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
