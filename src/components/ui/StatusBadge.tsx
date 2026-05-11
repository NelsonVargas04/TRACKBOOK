import { statusConfig, type Status } from '@/data/mockApplications'

export function StatusBadge({ status }: { status: Status }) {
  const c = statusConfig[status]
  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  )
}
