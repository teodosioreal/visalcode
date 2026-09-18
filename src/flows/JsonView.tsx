import { useEffect, useState } from 'react'
import { Dialog } from '../components/ui/Dialog'
import { Button } from '../components/ui/Button'
import type { FlowConfig } from './types'

export function JsonView({
  open,
  onClose,
  flow,
  onApply,
}: {
  open: boolean
  onClose: () => void
  flow: FlowConfig
  onApply: (next: FlowConfig) => void
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setText(JSON.stringify(flow, null, 2))
      setError('')
    }
  }, [open, flow])

  function handleApply() {
    try {
      const parsed = JSON.parse(text) as FlowConfig
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('O JSON precisa ter uma lista "steps".')
      }
      onApply(parsed)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON inválido.')
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onClose={onClose} title="Código-fonte do fluxo (JSON)" className="max-w-2xl">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--vb-text-muted)]">
          Isso é exatamente o arquivo de configuração por trás do editor visual. Edite aqui
          diretamente e clique em "Aplicar" para atualizar o fluxo — ou copie/baixe pra usar em
          outro lugar.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          rows={18}
          className="w-full rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-2)] p-3 font-mono text-xs text-[var(--vb-text)] outline-none focus:border-[var(--vb-accent)]"
        />
        {error ? (
          <p className="rounded-md bg-red-500/10 px-2.5 py-2 text-xs text-red-500">{error}</p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
            Copiar
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
