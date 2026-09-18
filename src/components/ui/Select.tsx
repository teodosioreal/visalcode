import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-3 py-2 pr-8 text-sm text-[var(--vb-text)] outline-none transition-colors focus:border-[var(--vb-accent)] focus:ring-2 focus:ring-[var(--vb-accent)]/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--vb-text-muted)]"
      />
    </div>
  )
}
