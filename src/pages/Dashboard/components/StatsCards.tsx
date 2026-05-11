import { useEffect, useState } from 'react'
import { Briefcase, MessageSquare, Star, FileText, ScrollText, TrendingUp } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { useCV } from '@/context/CVContext'
import { useCoverLetter } from '@/context/CoverLetterContext'
import { getApplications } from '@/services/applications.service'
import { useLang } from '@/context/LanguageContext'

function StatCard({
  label, rawValue, suffix = '', trend, trendUp, icon: Icon, color, bg, border,
}: {
  label: string
  rawValue: number
  suffix?: string
  trend: string
  trendUp: boolean | null
  icon: React.ElementType
  color: string
  bg: string
  border: string
}) {
  const animated = useCountUp(rawValue)

  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>

      <span className="font-black leading-none" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '36px', color: 'var(--color-text-primary)' }}>
        {animated}{suffix}
      </span>

      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full w-fit"
        style={{ background: trendUp !== null ? bg : 'var(--color-bg)', border: `1px solid ${trendUp !== null ? border : 'var(--color-border)'}` }}
      >
        {trendUp !== null && <TrendingUp size={10} style={{ color }} />}
        <span className="text-xs font-semibold" style={{ color: trendUp !== null ? color : 'var(--color-text-muted)' }}>
          {trend}
        </span>
      </div>
    </div>
  )
}

export default function StatsCards() {
  const { t } = useLang()
  const { cvs } = useCV()
  const { coverLetters } = useCoverLetter()
  const [total, setTotal] = useState(0)
  const [active, setActive] = useState(0)
  const [offers, setOffers] = useState(0)
  const [interviewRate, setInterviewRate] = useState(0)

  useEffect(() => {
    getApplications().then((rows) => {
      setTotal(rows.length)
      setActive(rows.filter((r: any) => r.status !== 'Rechazada').length)
      setOffers(rows.filter((r: any) => r.status === 'Oferta').length)
      const interviews = rows.filter((r: any) => r.status === 'Entrevista' || r.status === 'Oferta').length
      setInterviewRate(rows.length > 0 ? Math.round((interviews / rows.length) * 100) : 0)
    }).catch(console.error)
  }, [])

  const cards = [
    {
      label: t('stats.totalApps'),
      rawValue: total,
      suffix: '',
      trend: total > 0 ? `${total} ${t('stats.registered')}` : t('stats.noneYet'),
      trendUp: total > 0 ? true : null,
      icon: Briefcase,
      color: '#818cf8',
      bg: 'rgba(129,140,248,0.1)',
      border: 'rgba(129,140,248,0.25)',
    },
    {
      label: t('stats.activeApps'),
      rawValue: active,
      suffix: '',
      trend: total - active > 0 ? `${total - active} ${t('stats.rejected')}` : t('stats.noRejections'),
      trendUp: active > 0 ? true : null,
      icon: TrendingUp,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.1)',
      border: 'rgba(167,139,250,0.25)',
    },
    {
      label: t('stats.interviewRate'),
      rawValue: interviewRate,
      suffix: '%',
      trend: interviewRate > 0 ? t('stats.ofTotal') : t('stats.noInterviews'),
      trendUp: interviewRate > 0 ? true : null,
      icon: MessageSquare,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.25)',
    },
    {
      label: t('stats.cvsUploaded'),
      rawValue: cvs.length,
      suffix: '',
      trend: cvs.length > 0 ? `${cvs.length} ${cvs.length !== 1 ? t('stats.availablePlural') : t('stats.available')}` : t('stats.noneUploadedYet'),
      trendUp: cvs.length > 0 ? true : null,
      icon: FileText,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.25)',
    },
    {
      label: t('stats.coverLetters'),
      rawValue: coverLetters.length,
      suffix: '',
      trend: coverLetters.length > 0 ? `${coverLetters.length} ${coverLetters.length !== 1 ? t('stats.availablePlural') : t('stats.available')}` : t('stats.noneClYet'),
      trendUp: coverLetters.length > 0 ? true : null,
      icon: ScrollText,
      color: '#38bdf8',
      bg: 'rgba(56,189,248,0.1)',
      border: 'rgba(56,189,248,0.25)',
    },
    {
      label: t('stats.activeOffers'),
      rawValue: offers,
      suffix: '',
      trend: offers > 0 ? t('stats.pendingReview') : t('stats.noOffers'),
      trendUp: offers > 0 ? true : null,
      icon: Star,
      color: '#fb7185',
      bg: 'rgba(251,113,133,0.1)',
      border: 'rgba(251,113,133,0.25)',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  )
}
