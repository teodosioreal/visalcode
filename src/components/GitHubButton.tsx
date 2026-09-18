import { GitBranch, Settings, Check, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'
import type { GitHubSettings } from '../lib/github'

export type GitHubPushStatus = 'idle' | 'saving' | 'success' | 'error'

export function GitHubButton({
  settings,
  status,
  errorMessage,
  onOpenDialog,
  onPush,
}: {
  settings: GitHubSettings | null
  status: GitHubPushStatus
  errorMessage?: string
  onOpenDialog: () => void
  onPush: () => void
}) {
  if (!settings) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={onOpenDialog}>
        <GitBranch size={16} />
        <span className="hidden md:inline">Conectar GitHub</span>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onPush}
        disabled={status === 'saving'}
        title={`Salvar em ${settings.owner}/${settings.repo} (${settings.branch})`}
      >
        {status === 'success' ? (
          <Check size={16} className="text-emerald-500" />
        ) : status === 'error' ? (
          <AlertTriangle size={16} className="text-red-500" />
        ) : (
          <GitBranch size={16} />
        )}
        <span className="hidden md:inline">
          {status === 'saving'
            ? 'Salvando…'
            : status === 'success'
              ? 'Salvo no GitHub'
              : status === 'error'
                ? (errorMessage ?? 'Erro ao salvar')
                : 'Salvar no GitHub'}
        </span>
      </Button>
      <button
        type="button"
        onClick={onOpenDialog}
        title="Configurações da conexão GitHub"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--vb-border)] text-[var(--vb-text-muted)] hover:bg-[var(--vb-surface-2)] hover:text-[var(--vb-text)]"
      >
        <Settings size={15} />
      </button>
    </div>
  )
}
