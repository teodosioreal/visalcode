import { cn } from '../../lib/utils'

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-[var(--vb-accent)]' : 'bg-[var(--vb-surface-3)]',
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-1',
          )}
        />
      </span>
      {label ? (
        <span className="text-xs font-semibold text-[var(--vb-text)]">{label}</span>
      ) : null}
    </button>
  )
}
