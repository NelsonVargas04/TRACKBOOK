import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export interface ImportRow {
  company: string
  role: string
  source: string
  status: string
  url: string
  contact: string
  note: string
  created_at: string
  type: string
}

const STATUS_MAP: Record<string, string> = {
  'APPLIED':     'Aplicada',
  'IN PROCESS':  'En Proceso',
  'OFFER':       'Oferta',
  'HIRED':       'Oferta',
  'REJECTED':    'Rechazada',
  'GHOSTED':     'Ghosteado',
}

const SOURCE_MAP: Record<string, string> = {
  'linkedin':    'LinkedIn',
  'indeed':      'Indeed',
  'getonboard':  'GetOnBoard',
  'glassdoor':   'Glassdoor',
  'glassboard':  'Glassdoor',
  'referido':    'Referido',
  'referral':    'Referido',
}

const COMPANY_PORTALS = new Set([
  'email', 'avature', 'greenhouse', 'workday', 'ats genérico', 'ats generico',
  'clipboard', 'talent pool', 'emailhighbar', 'n5 now', 'mercado libre',
  'pedidosya', 'clerk', 'synaps', 'coderhouse', 'tempolabs', 'qualitylogic', 'globant',
])

function mapSource(platform: string): string {
  if (!platform) return 'Otro'
  const key = platform.trim().toLowerCase()
  if (SOURCE_MAP[key]) return SOURCE_MAP[key]
  if (COMPANY_PORTALS.has(key) || key.includes('email')) return 'Empresa'
  return 'Otro'
}

function mapStatus(status: string): 'Aplicada' | 'Screening' | 'Entrevista' | 'Oferta' | 'Rechazada' {
  const mapped = STATUS_MAP[status?.trim().toUpperCase()]
  return (mapped as any) ?? 'Aplicada'
}

function excelDateToISO(serial: number): string {
  const date = new Date((serial - 25569) * 86400 * 1000)
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const VALID_STATUSES = new Set(['Aplicada', 'En Proceso', 'Screening', 'Entrevista', 'Oferta', 'Rechazada', 'Ghosteado'])

// Parse Trackbook's own CSV export format
function parseTrackbookCSV(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const wb = XLSX.read(text, { type: 'string' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        const rows: ImportRow[] = []
        // Row 0 = headers: Empresa,Puesto,Estado,Modalidad,Estrellas,Salario,Origen,Contacto,URL,Notas,Fecha Aplicación,Última Actualización
        for (let i = 1; i < raw.length; i++) {
          const r = raw[i]
          const company = String(r[0] ?? '').trim()
          const role    = String(r[1] ?? '').trim()
          if (!company || !role) continue

          const status  = String(r[2] ?? '').trim()
          const type    = String(r[3] ?? 'Remoto').trim() || 'Remoto'
          const source  = String(r[6] ?? '').trim() || 'Otro'
          const contact = String(r[7] ?? '').trim()
          const url     = String(r[8] ?? '').trim()
          const note    = String(r[9] ?? '').trim()
          const dateRaw = String(r[10] ?? '').trim()

          const created_at = dateRaw
            ? (new Date(dateRaw).toISOString() || new Date().toISOString())
            : new Date().toISOString()

          rows.push({
            company, role,
            status: VALID_STATUSES.has(status) ? status : 'Aplicada',
            type,
            source,
            contact,
            url,
            note,
            created_at,
          })
        }
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsText(file, 'utf-8')
  })
}

// Parse Job Tracker Excel format (.xlsx)
function parseExcelFile(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        const rows: ImportRow[] = []
        // Row 0 = section headers, Row 1 = column headers, Row 2+ = data
        for (let i = 2; i < raw.length; i++) {
          const r = raw[i]
          const company = String(r[0] ?? '').trim()
          const role    = String(r[1] ?? '').trim()
          if (!company || !role) continue

          const platform      = String(r[2] ?? '').trim()
          const applyDate     = r[3]
          const recruiterName = String(r[5] ?? '').trim()
          const recruiterEmail= String(r[6] ?? '').trim()
          const excelStatus   = String(r[14] ?? '').trim()
          const nextAction    = String(r[15] ?? '').trim()

          const cellAddr = XLSX.utils.encode_cell({ r: i, c: 4 })
          const cell = sheet[cellAddr]
          const url = cell?.l?.Target ?? ''

          const contact = [recruiterName, recruiterEmail].filter(Boolean).join(' — ')
          const note = nextAction || ''

          let created_at: string
          if (typeof applyDate === 'number') {
            created_at = excelDateToISO(applyDate)
          } else if (applyDate) {
            created_at = new Date(String(applyDate)).toISOString()
          } else {
            created_at = new Date().toISOString()
          }

          rows.push({
            company, role,
            source: mapSource(platform),
            status: mapStatus(excelStatus),
            url, contact, note, created_at,
            type: 'Remoto',
          })
        }
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseFile(file: File): Promise<ImportRow[]> {
  return file.name.toLowerCase().endsWith('.csv')
    ? parseTrackbookCSV(file)
    : parseExcelFile(file)
}

export async function importApplications(
  rows: ImportRow[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const BATCH = 50
  let imported = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      company:    r.company,
      role:       r.role,
      source:     r.source as any,
      status:     r.status as any,
      url:        r.url || null,
      contact:    r.contact || null,
      note:       r.note || null,
      created_at: r.created_at,
      type:       r.type,
      user_id:    user.id,
      stars:      0,
    }))
    const { error } = await supabase.from('applications').insert(batch as any)
    if (error) throw error
    imported += batch.length
    onProgress?.(imported, rows.length)
  }
  return imported
}
