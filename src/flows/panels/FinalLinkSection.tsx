import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Switch } from '../../components/ui/Switch'
import type { FinalLinkConfig } from '../types'

export function FinalLinkSection({
  value,
  onChange,
}: {
  value: FinalLinkConfig
  onChange: (next: FinalLinkConfig) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Esta etapa termina com um link externo</Label>
        <Switch checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} />
      </div>

      {value.enabled ? (
        <>
          <p className="text-[11px] text-[var(--vb-text-muted)]">
            O botão desta etapa deixa de avançar pra outra etapa e passa a levar a pessoa pra
            esse link (ex: WhatsApp, checkout, agendamento). É o fim de verdade do fluxo.
          </p>
          <div>
            <Label htmlFor="final-link-url">URL de destino</Label>
            <Input
              id="final-link-url"
              placeholder="https://wa.me/55..."
              value={value.url}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="final-link-label">Texto do botão</Label>
            <Input
              id="final-link-label"
              value={value.label}
              onChange={(e) => onChange({ ...value, label: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="mb-0">Abrir em nova aba</Label>
            <Switch
              checked={value.openInNewTab}
              onChange={(openInNewTab) => onChange({ ...value, openInNewTab })}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
