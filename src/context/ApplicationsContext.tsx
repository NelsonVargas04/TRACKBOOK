import { createContext, useContext, useState, useEffect } from 'react'
import { getApplications, type AppWithActivity } from '@/services/applications.service'
import { useAuth } from '@/context/AuthContext'

type Row = AppWithActivity

interface ApplicationsContextValue {
  rows: Row[]
  loading: boolean
  reload: () => Promise<void>
  setRows: React.Dispatch<React.SetStateAction<Row[]>>
}

const ApplicationsContext = createContext<ApplicationsContextValue>({
  rows: [],
  loading: true,
  reload: async () => {},
  setRows: () => {},
})

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    try {
      const data = await getApplications()
      setRows(data)
    } finally {
      setLoading(false)
    }
  }

  // Fetch once per authenticated user; refetch when the user changes
  useEffect(() => {
    if (!session) {
      setRows([])
      setLoading(false)
      return
    }
    reload().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  return (
    <ApplicationsContext.Provider value={{ rows, loading, reload, setRows }}>
      {children}
    </ApplicationsContext.Provider>
  )
}

export function useApplications() {
  return useContext(ApplicationsContext)
}
