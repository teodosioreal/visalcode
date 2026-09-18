import { useState, type ReactNode } from 'react'
import { Download, LayoutGrid, Check } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/Button'
import { AddBlockButton } from './AddBlockButton'
import { GitHubButton, type GitHubPushStatus } from './GitHubButton'
import type { GitHubSettings } from '../lib/github'
import { formatFullDateTime, formatShortDateTime } from '../lib/utils'

export function TopBar({
  onDownload,
  saved,
  lastSavedAt,
  children,
  githubSettings,
  githubStatus,
  githubError,
  onOpenGitHubDialog,
  onPushToGitHub,
}: {
  onDownload: () => Promise<void> | void
  saved: boolean
  lastSavedAt: Date | null
  children?: ReactNode
  githubSettings: GitHubSettings | null
  githubStatus: GitHubPushStatus
  githubError?: string
  onOpenGitHubDialog: () => void
  onPushToGitHub: () => void
}) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await onDownload()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-2 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 shrink items-center gap-2 overflow-hidden sm:gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--vb-accent)] text-white">
          <LayoutGrid size={18} />
        </div>
        <div className="min-w-0">
          <p className="hidden truncate text-sm font-bold leading-tight text-[var(--vb-text)] sm:block">
            Editor Visual
          </p>
          <p
            className="flex items-center gap-1 truncate text-[11px] leading-tight text-[var(--vb-text-muted)]"
            title={lastSavedAt ? `Última alteração: ${formatFullDateTime(lastSavedAt)}` : undefined}
          >
            {saved ? <Check size={11} className="shrink-0 text-emerald-500" /> : null}
            {saved
              ? lastSavedAt
                ? `Salvo às ${formatShortDateTime(lastSavedAt)}`
                : 'Salvo automaticamente'
              : 'Editando…'}
          </p>
        </div>
      </div>

      <div className="hidden flex-1 justify-center md:flex">{children}</div>

      <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
        <AddBlockButton />
        <GitHubButton
          settings={githubSettings}
          status={githubStatus}
          errorMessage={githubError}
          onOpenDialog={onOpenGitHubDialog}
          onPush={onPushToGitHub}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          title="Baixar Projeto (.zip)"
        >
          <Download size={16} />
          <span className="hidden md:inline">
            {downloading ? 'Empacotando…' : 'Baixar Projeto (.zip)'}
          </span>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}
