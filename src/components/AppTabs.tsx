import { Link } from '@tanstack/react-router'
import { LayoutGrid, Workflow } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Páginas', icon: LayoutGrid },
  { to: '/flows', label: 'Fluxos', icon: Workflow },
] as const

export function AppTabs() {
  return (
    <nav className="flex h-9 shrink-0 items-center gap-1 border-b border-[var(--vb-border)] bg-[var(--vb-surface-2)] px-2">
      {tabs.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: true }}
          className="flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-semibold text-[var(--vb-text-muted)] transition-colors hover:text-[var(--vb-text)] [&.active]:bg-[var(--vb-surface-1)] [&.active]:text-[var(--vb-text)]"
          activeProps={{ className: 'active' }}
        >
          <Icon size={13} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
