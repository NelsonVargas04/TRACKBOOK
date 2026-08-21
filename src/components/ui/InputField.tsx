export function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs tracking-widest uppercase font-semibold"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 text-base outline-none"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          transition: 'border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onMouseEnter={(e) => {
          if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = 'var(--color-accent-border)'
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />
    </div>
  )
}
