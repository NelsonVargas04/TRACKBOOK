import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import ConversionFunnel from './components/ConversionFunnel'
import RecentActivity from './components/RecentActivity'
import GhostingAnalytics from './components/GhostingAnalytics'
import TimelineChart from './components/TimelineChart'
import SourcesChart from './components/SourcesChart'
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
            <Button
              variant="secondary"
              onClick={handleExport}
              loading={exporting}
              icon={Download}
            >
              {t('dashboard.export')}
            </Button>
          </div>

          <div className="flex flex-col gap-6 reveal">
            <StatsCards />
            <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'stretch' }}>
              <ConversionFunnel />
              <SourcesChart />
            </div>
            <TimelineChart />
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
