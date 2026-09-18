import { useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Switch } from '../components/ui/Switch'
import { Button } from '../components/ui/Button'
import { buildWebhookPayload, sendWebhook } from './webhook'
import type { FlowConfig } from './types'

const DEFAULT_WEBHOOK = { enabled: false, url: '' }

export function FlowSettingsDialog({
  open,
  onClose,
  flow,
  onChange,
}: {
  open: boolean
  onClose: () => void
  flow: FlowConfig
  onChange: (patch: Partial<FlowConfig>) => void
}) {
  const webhook = flow.webhook ?? DEFAULT_WEBHOOK
  const [testState, setTestState] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle')
  const [testMessage, setTestMessage] = useState('')

  async function handleTest() {
    if (!webhook.url) return
    setTestState('sending')
    const payload = buildWebhookPayload(
      flow,
      { teste: 'Isso é um envio de teste do editor de fluxos' },
      new Map(),
    )
    const result = await sendWebhook(webhook.url, payload)
    if (result.ok) {
      setTestState('ok')
      setTestMessage(`Recebido! (status ${result.status})`)
    } else {
      setTestState('fail')
      setTestMessage(result.error || `O servidor respondeu com status ${result.status}.`)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Configurações do fluxo" className="max-w-lg">
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="flow-name">Nome do fluxo</Label>
          <Input
            id="flow-name"
            value={flow.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="rounded-lg border border-[var(--vb-border)] p-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Enviar respostas pra um webhook</Label>
            <Switch
              checked={webhook.enabled}
              onChange={(enabled) => {
                onChange({ webhook: { ...webhook, enabled } })
                setTestState('idle')
              }}
            />
          </div>

          {webhook.enabled ? (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-[11px] text-[var(--vb-text-muted)]">
                Toda vez que alguém completar o fluxo (chegar no fim ou clicar no link final),
                mandamos um POST com as respostas em JSON pra essa URL — direto do navegador de
                quem preencheu, sem passar por nenhum servidor nosso. Cole aqui um webhook do
                Zapier, Make, n8n, ou de um endpoint seu.
              </p>
              <div>
                <Label htmlFor="webhook-url">URL do webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/..."
                  value={webhook.url}
                  onChange={(e) => {
                    onChange({ webhook: { ...webhook, url: e.target.value } })
                    setTestState('idle')
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!webhook.url || testState === 'sending'}
                  onClick={handleTest}
                >
                  {testState === 'sending' ? <Loader2 size={14} className="animate-spin" /> : null}
                  Testar webhook
                </Button>
                {testState === 'ok' ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={14} />
                    {testMessage}
                  </span>
                ) : null}
                {testState === 'fail' ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                    <XCircle size={14} />
                    {testMessage}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Dialog>
  )
}
