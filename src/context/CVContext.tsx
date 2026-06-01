import { createContext, useContext, useState, useEffect } from 'react'
import { getCVs } from '@/services/cvs.service'

export interface CV {
  id: number
  cvCode: string
  name: string
  date: string
  size: string
  url?: string
}

interface CVContextValue {
  cvs: CV[]
  loading: boolean
  primaryId: number | null
  setCVs: React.Dispatch<React.SetStateAction<CV[]>>
  setPrimaryId: (id: number | null) => void
  reload: () => Promise<void>
}

const CVContext = createContext<CVContextValue>({
  cvs: [],
  loading: true,
  primaryId: null,
  setCVs: () => {},
  setPrimaryId: () => {},
  reload: async () => {},
})

// Next code = max existing numeric suffix + 1 (robusto ante borrados/altas)
function genCode(existing: CV[]) {
  const max = existing.reduce((m, cv) => {
    const n = parseInt(cv.cvCode.replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `CV-${String(max + 1).padStart(6, '0')}`
}

function rowToCV(row: any): CV {
  const date = new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  return {
    id: row.id,
    cvCode: row.cv_code,
    name: row.name,
    date,
    size: row.size,
    url: row.url ?? undefined,
  }
}

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cvs, setCVs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryId, setPrimaryIdState] = useState<number | null>(null)

  async function reload() {
    setLoading(true)
    try {
      const rows = await getCVs()
      const mapped = rows.map(rowToCV)
      setCVs(mapped)
      const primary = rows.find((r: any) => r.is_primary) as { id: number } | undefined
      if (primary) setPrimaryIdState(primary.id)
      else if (rows.length === 1) setPrimaryIdState(rows[0].id)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload().catch(console.error) }, [])

  function setPrimaryId(id: number | null) {
    setPrimaryIdState(id)
  }

  return (
    <CVContext.Provider value={{ cvs, loading, primaryId, setCVs, setPrimaryId, reload }}>
      {children}
    </CVContext.Provider>
  )
}

export function useCV() {
  return useContext(CVContext)
}

export { genCode }
