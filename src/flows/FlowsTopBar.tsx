import { useRef } from 'react'
import { Check, Code2, Download, ExternalLink, Settings2, Upload, Workflow } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { formatFullDateTime, formatShortDateTime } from '../lib/utils'

export function FlowsTopBar({
  flowName,
  lastSavedAt,
  webhookEnabled,
  onOpenSettings,
  onOpenJson,
  onImport,
  onDownload,
  importing,
}: {
  flowName: string
  lastSavedAt: Date | null
  webhookEnabled?: boolean
  onOpenSettings: () => void
  onOpenJson: () => void
  onImport: (file: File) => void
  onDownload: () => void
  importing?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-2 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 shrink items-center gap-2 overflow-hidden sm:gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--vb-accent)] text-white">
          <Workflow size={18} />
        </div>
        <div className="min-w-0">
          <p className="hidden truncate text-sm font-bold leading-tight text-[var(--vb-text)] sm:block">
            {flowName || 'Editor de Fluxos'}
          </p>
          <p
            className="flex items-center gap-1 truncate text-[11px] leading-tight text-[var(--vb-text-muted)]"
            title={lastSavedAt ? `Última alteração: ${formatFullDateTime(lastSavedAt)}` : undefined}
          >
            {lastSavedAt ? <Check size={11} className="shrink-0 text-emerald-500" /> : null}
            {lastSavedAt ? `Salvo às ${formatShortDateTime(lastSavedAt)}` : 'Salvo automaticamente'}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => window.open('/formulario', '_blank')}
          title="Abre a página pública do formulário — é isso que você compartilha com quem vai preencher de verdade"
        >
          <ExternalLink size={16} />
          <span className="hidden md:inline">Página pública</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenSettings}
          title="Configurações do fluxo (nome, webhook)"
          className="relative"
        >
          <Settings2 size={16} />
          <span className="hidden md:inline">Webhook</span>
          {webhookEnabled ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500" />
          ) : null}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenJson} title="Ver/editar JSON">
          <Code2 size={16} />
          <span className="hidden md:inline">Ver JSON</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          title="Importar .json de fluxo, .tsx/.ts/.js com perguntas, ou .zip de um projeto inteiro"
        >
          <Upload size={16} />
          <span className="hidden md:inline">{importing ? 'Lendo .zip…' : 'Importar'}</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json,.tsx,.ts,.jsx,.js,.zip,application/zip,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImport(file)
            e.target.value = ''
          }}
        />
        <Button type="button" variant="primary" size="sm" onClick={onDownload} title="Baixar .json">
          <Download size={16} />
          <span className="hidden md:inline">Baixar .json</span>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}
