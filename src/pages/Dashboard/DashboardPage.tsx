import { useState } from 'react'
import { Download } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import ConversionFunnel from './components/ConversionFunnel'
import RecentActivity from './components/RecentActivity'
import GhostingAnalytics from './components/GhostingAnalytics'
import { useLang } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { exportCSV } from '@/services/export.service'

export default function DashboardPage() {
  const { t } = useLang()
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      const name = (user?.user_metadata?.full_name as string) ?? user?.email ?? 'usuario'
      await exportCSV(name)
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setExporting(false)
    }
  }
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-3xl font-black"
                style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}
              >
                {t('dashboard.title')}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('dashboard.subtitle')}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Download size={14} />
              {exporting ? '…' : t('dashboard.export')}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <StatsCards />
            <ConversionFunnel />
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <RecentActivity />
              <GhostingAnalytics />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
