export function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--color-accent-light)' }}
      >
        <Icon size={24} style={{ color: 'var(--color-accent-text)' }} />
      </div>
      <h2
        className="font-bold text-xl"
        style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}
      >
        {label}
      </h2>
    </div>
  )
}
