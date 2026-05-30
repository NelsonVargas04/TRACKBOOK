import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowRight } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { BrandLogo } from '@/components/BrandLogo'

export default function SessionExpiredPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: '#0f0f17' }}
    >
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="flex flex-col items-center text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          maxWidth: 420,
          padding: '0 24px',
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <BrandLogo iconSize={36} fontSize={22} />
        </div>

        <div
          className="relative flex items-center justify-center mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.7)',
            transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
          }}
        >
          <div className="absolute rounded-full" style={{ width: 100, height: 100, background: 'rgba(139,92,246,0.06)', animation: 'ping-slow 2.5s ease-out infinite' }} />
          <div className="absolute rounded-full" style={{ width: 76, height: 76, background: 'rgba(139,92,246,0.08)' }} />
          <div className="relative flex items-center justify-center rounded-2xl" style={{ width: 64, height: 64, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <ShieldOff size={28} style={{ color: '#a78bfa' }} />
          </div>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '30px', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            {t('expired.title')}
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, margin: '0 0 36px' }}>
            {t('expired.desc')}
          </p>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease 0.3s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s',
            width: '100%',
          }}
        >
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7C6FCD 0%, #9f6fcd 100%)', color: '#fff', fontSize: '15px', letterSpacing: '0.04em', boxShadow: '0 4px 24px rgba(124,111,205,0.4)', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,111,205,0.6)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,111,205,0.4)')}
          >
            {t('expired.cta')}
            <ArrowRight size={16} />
          </button>

          <p style={{ marginTop: 20, fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>
            {t('expired.safe')}
          </p>
        </div>
      </div>
    </div>
  )
}
