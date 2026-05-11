export function CompanyIcon({ icon, size = 'md' }: { icon: string; size?: 'md' | 'lg' }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold shrink-0"
      style={{
        width: size === 'lg' ? 48 : 40,
        height: size === 'lg' ? 48 : 40,
        fontSize: size === 'lg' ? 20 : 14,
        background: 'var(--color-accent-light)',
        color: 'var(--color-accent-text)',
        border: '1px solid var(--color-accent-border)',
      }}
    >
      {icon}
    </div>
  )
}
