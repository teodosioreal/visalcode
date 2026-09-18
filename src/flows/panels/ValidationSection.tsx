import { Label } from '../../components/ui/Label'
import { Input } from '../../components/ui/Input'
import { Switch } from '../../components/ui/Switch'
import type { AdvanceTrigger, StepValidation } from '../types'

export function ValidationSection({
  value,
  onChange,
}: {
  value: StepValidation
  onChange: (next: StepValidation) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Etapa obrigatória</Label>
        <Switch
          checked={value.required}
          onChange={(required) => onChange({ ...value, required })}
        />
      </div>

      <div>
        <Label>Como avança para a próxima etapa</Label>
        <div className="flex flex-col gap-1.5">
          {(
            [
              { value: 'auto', label: 'Sozinho, assim que preencher/selecionar' },
              { value: 'button', label: 'Só ao clicar em "Próximo"' },
            ] satisfies Array<{ value: AdvanceTrigger; label: string }>
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--vb-border)] px-3 py-2 text-sm text-[var(--vb-text)] has-[:checked]:border-[var(--vb-accent)] has-[:checked]:bg-[var(--vb-accent)]/10"
            >
              <input
                type="radio"
                name="advanceTrigger"
                className="accent-[var(--vb-accent)]"
                checked={value.advanceTrigger === opt.value}
                onChange={() => onChange({ ...value, advanceTrigger: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {value.advanceTrigger === 'button' ? (
        <div>
          <Label htmlFor="next-btn-label">Texto do botão de avançar</Label>
          <Input
            id="next-btn-label"
            value={value.nextButtonLabel}
            onChange={(e) => onChange({ ...value, nextButtonLabel: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}
