export function Spinner({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-full border-2 border-t-transparent animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: 'var(--color-accent)',
        borderTopColor: 'transparent',
      }}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <Spinner size={32} />
    </div>
  )
}
