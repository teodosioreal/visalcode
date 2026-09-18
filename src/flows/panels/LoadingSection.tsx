import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Switch } from '../../components/ui/Switch'
import type { LoadingConfig } from '../types'

export function LoadingSection({
  value,
  onChange,
}: {
  value: LoadingConfig
  onChange: (next: LoadingConfig) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Mostrar barra de carregamento ao sair desta etapa</Label>
        <Switch checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} />
      </div>

      {value.enabled ? (
        <>
          <div>
            <Label htmlFor="loading-message">Mensagem durante o carregamento</Label>
            <Input
              id="loading-message"
              value={value.message}
              onChange={(e) => onChange({ ...value, message: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="loading-duration">Duração (ms)</Label>
            <Input
              id="loading-duration"
              type="number"
              min={200}
              step={100}
              value={value.durationMs}
              onChange={(e) => onChange({ ...value, durationMs: Number(e.target.value) || 0 })}
            />
          </div>
          <p className="text-[11px] text-[var(--vb-text-muted)]">
            Dá a impressão de que a resposta foi analisada antes de mostrar a próxima etapa — não
            processa nada de verdade, é só visual.
          </p>
        </>
      ) : null}
    </div>
  )
}
