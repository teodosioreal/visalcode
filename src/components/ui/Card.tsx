import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--vb-border)] bg-[var(--vb-surface-1)]',
        className,
      )}
      {...props}
    />
  )
}
