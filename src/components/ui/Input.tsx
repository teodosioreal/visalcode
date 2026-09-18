import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const fieldStyles =
  'w-full rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-3 py-2 text-sm text-[var(--vb-text)] outline-none transition-colors placeholder:text-[var(--vb-text-muted)] focus:border-[var(--vb-accent)] focus:ring-2 focus:ring-[var(--vb-accent)]/20'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, 'resize-y', className)} {...props} />
}
