import { Label } from '../../components/ui/Label'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import type { Easing, TransitionConfig, TransitionType } from '../types'

const TYPE_OPTIONS: Array<{ value: TransitionType; label: string }> = [
  { value: 'fade', label: 'Fade (esmaecer)' },
  { value: 'slide-left', label: 'Deslizar para a esquerda' },
  { value: 'slide-right', label: 'Deslizar para a direita' },
  { value: 'slide-up', label: 'Deslizar para cima' },
  { value: 'step-up', label: 'Subir um degrau (step-up)' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'none', label: 'Sem transição' },
]

const EASING_OPTIONS: Array<{ value: Easing; label: string }> = [
  { value: 'ease-in-out', label: 'ease-in-out' },
  { value: 'ease', label: 'ease' },
  { value: 'ease-in', label: 'ease-in' },
  { value: 'ease-out', label: 'ease-out' },
  { value: 'linear', label: 'linear' },
  { value: 'cubic-bezier', label: 'cubic-bezier (personalizado)' },
]

export function TransitionSection({
  value,
  onChange,
}: {
  value: TransitionConfig
  onChange: (next: TransitionConfig) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label htmlFor="tr-type">Tipo de animação</Label>
        <Select
          id="tr-type"
          value={value.type}
          onChange={(e) => onChange({ ...value, type: e.target.value as TransitionType })}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="tr-duration">Duração (ms)</Label>
          <Input
            id="tr-duration"
            type="number"
            min={0}
            step={50}
            value={value.durationMs}
            onChange={(e) => onChange({ ...value, durationMs: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="tr-delay">Atraso / delay (ms)</Label>
          <Input
            id="tr-delay"
            type="number"
            min={0}
            step={50}
            value={value.delayMs}
            onChange={(e) => onChange({ ...value, delayMs: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tr-easing">Curva de animação (easing)</Label>
        <Select
          id="tr-easing"
          value={value.easing}
          onChange={(e) => onChange({ ...value, easing: e.target.value as Easing })}
        >
          {EASING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {value.easing === 'cubic-bezier' ? (
        <div>
          <Label>cubic-bezier(x1, y1, x2, y2)</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {value.cubicBezier.map((n, i) => (
              <Input
                key={i}
                type="number"
                step={0.05}
                value={n}
                onChange={(e) => {
                  const next = [...value.cubicBezier] as TransitionConfig['cubicBezier']
                  next[i] = Number(e.target.value) || 0
                  onChange({ ...value, cubicBezier: next })
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
