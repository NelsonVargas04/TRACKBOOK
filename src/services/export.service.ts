import { supabase } from '@/lib/supabase'

type AppRow = {
  id: number
  role: string
  company: string
  status: string
  type: string
  stars: number
  salary: string | null
  note: string | null
  contact: string | null
  source: string | null
  url: string | null
  tag: string | null
  created_at: string
  updated_at: string | null
}

async function fetchAllData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('applications')
    .select('id, role, company, status, type, stars, salary, note, contact, source, url, tag, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AppRow[]
}

// ── CSV ──────────────────────────────────────────────────────────────────────

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function exportCSV(userName: string) {
  const apps = await fetchAllData()

  const headers = [
    'Empresa', 'Puesto', 'Estado', 'Modalidad', 'Estrellas',
    'Salario', 'Origen', 'Contacto', 'URL', 'Notas', 'Fecha Aplicación', 'Última Actualización',
  ]

  const rows = apps.map((a) => [
    a.company, a.role, a.status, a.type, a.stars,
    a.salary, a.source, a.contact, a.url, a.note,
    a.created_at.slice(0, 10),
    a.updated_at ? a.updated_at.slice(0, 10) : '',
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n')

  const BOM = '﻿'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trackbook_${userName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── PDF ──────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Aplicada:   '#94a3b8',
  Screening:  '#a78bfa',
  Entrevista: '#f59e0b',
  Oferta:     '#22c55e',
  Rechazada:  '#ef4444',
}

function badge(status: string) {
  const color = STATUS_COLORS[status] ?? '#94a3b8'
  return `<span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;color:${color};background:${color}22;border:1px solid ${color}44">${status}</span>`
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

export async function exportPDF(userName: string, userRole: string) {
  // Open the window synchronously (before any await) to avoid popup blockers
  const win = window.open('', '_blank', 'width=960,height=720')
  if (!win) {
    alert('El navegador bloqueó la ventana emergente. Permite popups para este sitio e intenta de nuevo.')
    return
  }

  // Show a loading state in the new window while data loads
  win.document.write('<html><body style="background:#0f1117;color:#64748b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:14px">Generando reporte…</body></html>')

  const apps = await fetchAllData()

  const total     = apps.length
  const byStatus  = apps.reduce<Record<string, number>>((acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc }, {})
  const responses = apps.filter((a) => ['Screening', 'Entrevista', 'Oferta', 'Rechazada'].includes(a.status)).length
  const responseRate = total ? Math.round((responses / total) * 100) : 0

  const appRows = apps.map((a) => `
    <tr>
      <td>${a.company}</td>
      <td>${a.role}</td>
      <td>${badge(a.status)}</td>
      <td>${a.type}</td>
      <td style="color:#f59e0b;letter-spacing:1px">${stars(a.stars)}</td>
      <td>${a.salary ? a.salary.replace(/[^0-9.]/g, '') ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(a.salary.replace(/[^0-9.]/g, ''))) : a.salary : '—'}</td>
      <td>${a.source ?? '—'}</td>
      <td>${a.created_at.slice(0, 10)}</td>
    </tr>
  `).join('')

  const statCards = Object.entries(byStatus).map(([status, count]) => {
    const color = STATUS_COLORS[status] ?? '#94a3b8'
    return `
      <div style="flex:1;min-width:100px;padding:14px 16px;border-radius:12px;background:${color}15;border:1px solid ${color}40;text-align:center">
        <div style="font-size:24px;font-weight:800;color:${color}">${count}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px">${status}</div>
      </div>
    `
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Trackbook — Reporte de ${userName}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='%237c3aed'/><path d='M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z' fill='none' stroke='white' stroke-width='2'/><path d='M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4' fill='none' stroke='white' stroke-width='2'/></svg>"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; padding: 40px 48px; font-size: 13px; line-height: 1.5 }
  h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: #fff }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-bottom: 14px; margin-top: 32px }
  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid #1e293b }
  .header-left { display: flex; align-items: center; gap: 14px }
  .logo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg,#7c3aed,#6d28d9); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 16px rgba(124,58,237,0.45) }
  .meta { font-size: 12px; color: #64748b; text-align: right; line-height: 1.8 }
  .stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px }
  .stat-total { padding: 14px 20px; border-radius: 12px; background: #1e293b; border: 1px solid #334155; min-width: 100px; text-align: center }
  .stat-total .num { font-size: 28px; font-weight: 800; color: #fff }
  .stat-total .lbl { font-size: 11px; color: #64748b; margin-top: 2px }
  table { width: 100%; border-collapse: collapse; margin-top: 8px }
  th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #64748b; border-bottom: 1px solid #1e293b }
  td { padding: 10px 12px; border-bottom: 1px solid #1e2332; vertical-align: middle; color: #cbd5e1 }
  tr:last-child td { border-bottom: none }
  tr:nth-child(even) td { background: #111827 }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; display: flex; justify-content: space-between }
  .print-btn { position:fixed; top:16px; right:16px; padding:10px 20px; border-radius:10px; background:#7c3aed; color:#fff; font-weight:700; font-size:13px; border:none; cursor:pointer; z-index:999 }
  .print-btn:hover { background:#6d28d9 }
  @media print { .print-btn { display:none } body { background: #0f1117 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact } }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">⬇ Guardar PDF</button>

  <div class="header">
    <div class="header-left">
      <div class="logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
      <div>
        <h1>Reporte de Búsqueda</h1>
        <div style="color:#64748b;font-size:13px;margin-top:3px">${userName}${userRole ? ` · ${userRole}` : ''}</div>
      </div>
    </div>
    <div class="meta">
      Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}<br/>
      Trackbook
    </div>
  </div>

  <h2>Resumen</h2>
  <div class="stats">
    <div class="stat-total">
      <div class="num">${total}</div>
      <div class="lbl">Total aplicaciones</div>
    </div>
    <div class="stat-total">
      <div class="num">${responseRate}%</div>
      <div class="lbl">Tasa de respuesta</div>
    </div>
    ${statCards}
  </div>

  <h2>Historial de Aplicaciones</h2>
  <table>
    <thead>
      <tr>
        <th>Empresa</th><th>Puesto</th><th>Estado</th><th>Modalidad</th>
        <th>Valoración</th><th>Salario</th><th>Origen</th><th>Fecha</th>
      </tr>
    </thead>
    <tbody>${appRows}</tbody>
  </table>

  <div class="footer">
    <span>Trackbook — Tu gestor de búsqueda de empleo</span>
    <span>${total} aplicaciones exportadas</span>
  </div>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
}
