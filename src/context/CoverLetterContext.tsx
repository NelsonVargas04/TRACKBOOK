import { createContext, useContext, useState, useEffect } from 'react'
import { getCoverLetters } from '@/services/coverLetters.service'

export interface CoverLetter {
  id: number
  clCode: string
  name: string
  date: string
  content: string
  preview: string
}

interface CoverLetterContextValue {
  coverLetters: CoverLetter[]
  loading: boolean
  primaryCLId: number | null
  setCoverLetters: React.Dispatch<React.SetStateAction<CoverLetter[]>>
  setPrimaryCLId: (id: number | null) => void
  reload: () => Promise<void>
}

const CoverLetterContext = createContext<CoverLetterContextValue>({
  coverLetters: [],
  loading: true,
  primaryCLId: null,
  setCoverLetters: () => {},
  setPrimaryCLId: () => {},
  reload: async () => {},
})

// Next code = max existing numeric suffix + 1 (robusto ante borrados/altas)
function genCLCode(existing: CoverLetter[]) {
  const max = existing.reduce((m, cl) => {
    const n = parseInt(cl.clCode.replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `CL-${String(max + 1).padStart(6, '0')}`
}

function rowToCL(row: any): CoverLetter {
  const date = new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  return {
    id: row.id,
    clCode: row.cl_code,
    name: row.name,
    date,
    content: row.content,
    preview: row.preview,
  }
}

export function CoverLetterProvider({ children }: { children: React.ReactNode }) {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryCLId, setPrimaryCLIdState] = useState<number | null>(null)

  async function reload() {
    setLoading(true)
    try {
      const rows = await getCoverLetters()
      setCoverLetters(rows.map(rowToCL))
      const primary = rows.find((r: any) => r.is_primary) as { id: number } | undefined
      if (primary) setPrimaryCLIdState(primary.id)
      else if (rows.length === 1) setPrimaryCLIdState(rows[0].id)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload().catch(console.error) }, [])

  function setPrimaryCLId(id: number | null) {
    setPrimaryCLIdState(id)
  }

  return (
    <CoverLetterContext.Provider value={{ coverLetters, loading, primaryCLId, setCoverLetters, setPrimaryCLId, reload }}>
      {children}
    </CoverLetterContext.Provider>
  )
}

export function useCoverLetter() {
  return useContext(CoverLetterContext)
}

export { genCLCode }
