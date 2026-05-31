import { useState, useRef } from 'react'
import { Upload, FileText, X, Star, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useLang } from '@/context/LanguageContext'

interface UploadModalProps {
  onClose: () => void
  onAdd: (file: File, markAsPrimary: boolean) => void
  loading?: boolean
}

export function UploadModal({ onClose, onAdd, loading = false }: UploadModalProps) {
  const { t } = useLang()
  const [dragOver, setDragOver] = useState(false)
  const [pending, setPending] = useState<File | null>(null)
  const [markAsPrimary, setMarkAsPrimary] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const pdf = Array.from(files).find((f) => f.type === 'application/pdf')
    if (pdf) setPending(pdf)
  }

  function confirm() {
    if (!pending) return
    onAdd(pending, markAsPrimary)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div
        className="rounded-2xl p-7 w-[480px] flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
              {t('upload.title')}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('upload.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: dragOver ? 'var(--color-accent-light)' : 'var(--color-bg)',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-light)' }}>
            <Upload size={24} style={{ color: 'var(--color-accent-text)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t('upload.dropzone')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {t('upload.or')} <span style={{ color: 'var(--color-accent-text)', fontWeight: 600 }}>{t('upload.click')}</span>
            </p>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t('upload.hint')}</p>
        </div>

        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        {/* Selected file preview */}
        {pending && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)' }}>
              <FileText size={16} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{pending.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{Math.round(pending.size / 1024)} KB</p>
            </div>
            <button onClick={() => setPending(null)} style={{ color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Mark as primary toggle */}
        <button
          onClick={() => setMarkAsPrimary((v) => !v)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all"
          style={{
            background: markAsPrimary ? 'rgba(245,158,11,0.08)' : 'var(--color-bg)',
            border: `1.5px solid ${markAsPrimary ? 'rgba(245,158,11,0.4)' : 'var(--color-border)'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{ background: markAsPrimary ? 'rgba(245,158,11,0.2)' : 'var(--color-accent-light)' }}
          >
            <Star size={15} fill={markAsPrimary ? '#f59e0b' : 'none'} style={{ color: markAsPrimary ? '#f59e0b' : 'var(--color-accent-text)' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: markAsPrimary ? '#f59e0b' : 'var(--color-text-primary)' }}>
              {t('upload.markPrimary')}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t('upload.markPrimarySub')}
            </p>
          </div>
          <div
            className="w-10 h-6 rounded-full transition-colors flex items-center shrink-0"
            style={{ background: markAsPrimary ? '#f59e0b' : 'var(--color-border)', padding: '2px' }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: markAsPrimary ? 'translateX(16px)' : 'translateX(0px)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            />
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            {t('upload.cancel')}
          </button>
          <button
            onClick={confirm}
            disabled={!pending || loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity flex items-center gap-2"
            style={{ background: 'var(--color-accent)', opacity: pending && !loading ? 1 : 0.4, cursor: pending && !loading ? 'pointer' : 'not-allowed' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? t('upload.uploading') : t('upload.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
