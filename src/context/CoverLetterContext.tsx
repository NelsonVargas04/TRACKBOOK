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

function genCLCode(n: number) {
  return `CL-${String(n).padStart(6, '0')}`
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
