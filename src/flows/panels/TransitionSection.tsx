import { useState } from 'react'
import { Label } from '../../components/ui/Label'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { cn } from '../../lib/utils'
import { transitionStyle } from '../transitionStyles'
import type { Easing, TransitionConfig, TransitionType } from '../types'

const TYPE_OPTIONS: Array<{ value: TransitionType; label: string }> = [
  { value: 'fade', label: 'Fade (esmaecer)' },
  { value: 'slide-left', label: 'Deslizar para a esquerda' },
  { value: 'slide-right', label: 'Deslizar para a direita' },
  { value: 'slide-up', label: 'Deslizar para cima' },
  { value: 'slide-down', label: 'Deslizar para baixo' },
  { value: 'step-up', label: 'Subir um degrau (step-up)' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'flip', label: 'Virar (flip 3D)' },
  { value: 'blur', label: 'Desfoque (blur)' },
  { value: 'bounce', label: 'Quicar (bounce elástico)' },
  { value: 'rotate', label: 'Girar (rotate)' },
  { value: 'none', label: 'Sem transição' },
]

const PRESETS: Array<{ label: string; config: TransitionConfig }> = [
  {
    label: 'Suave',
    config: { type: 'fade', durationMs: 350, easing: 'ease-in-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Rápido e direto',
    config: { type: 'fade', durationMs: 160, easing: 'ease-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Deslizar',
    config: { type: 'slide-left', durationMs: 350, easing: 'ease-in-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Subir suave',
    config: { type: 'slide-up', durationMs: 380, easing: 'ease-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Dramático',
    config: { type: 'zoom', durationMs: 550, easing: 'cubic-bezier', cubicBezier: [0.34, 1.56, 0.64, 1], delayMs: 0 },
  },
  {
    label: 'Quicar',
    config: { type: 'bounce', durationMs: 500, easing: 'ease-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Virar',
    config: { type: 'flip', durationMs: 450, easing: 'ease-in-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Desfoque',
    config: { type: 'blur', durationMs: 400, easing: 'ease-out', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
  {
    label: 'Nenhum',
    config: { type: 'none', durationMs: 0, easing: 'linear', cubicBezier: [0.4, 0, 0.2, 1], delayMs: 0 },
  },
]

const EASING_OPTIONS: Array<{ value: Easing; label: string }> = [
  { value: 'ease-in-out', label: 'ease-in-out' },
  { value: 'ease', label: 'ease' },
  { value: 'ease-in', label: 'ease-in' },
  { value: 'ease-out', label: 'ease-out' },
  { value: 'linear', label: 'linear' },
  { value: 'cubic-bezier', label: 'cubic-bezier (personalizado)' },
]

function isSamePreset(a: TransitionConfig, b: TransitionConfig) {
  return (
    a.type === b.type &&
    a.durationMs === b.durationMs &&
    a.easing === b.easing &&
    a.delayMs === b.delayMs &&
    (a.easing !== 'cubic-bezier' || a.cubicBezier.join(',') === b.cubicBezier.join(','))
  )
}

export function TransitionSection({
  value,
  onChange,
  onApplyToAll,
}: {
  value: TransitionConfig
  onChange: (next: TransitionConfig) => void
  onApplyToAll?: () => void
}) {
  const [previewPhase, setPreviewPhase] = useState<'from' | 'to'>('to')
  const [copiedToAll, setCopiedToAll] = useState(false)

  function replayPreview() {
    setPreviewPhase('from')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPreviewPhase('to'))
    })
  }

  function handleApplyToAll() {
    if (!onApplyToAll) return
    onApplyToAll()
    setCopiedToAll(true)
    setTimeout(() => setCopiedToAll(false), 1600)
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Modelos prontos</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.config)
                setTimeout(replayPreview, 0)
              }}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                isSamePreset(value, preset.config)
                  ? 'border-[var(--vb-accent)] bg-[var(--vb-accent)]/10 text-[var(--vb-accent)]'
                  : 'border-[var(--vb-border)] text-[var(--vb-text-muted)] hover:border-[var(--vb-accent)]',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-2)] p-3">
        <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--vb-surface-3)]">
          <div
            style={transitionStyle(value, previewPhase)}
            className="h-8 w-14 rounded bg-[var(--vb-accent)]"
          />
        </div>
        <div className="flex flex-1 items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--vb-text-muted)]">
            Veja o efeito sem precisar testar o fluxo inteiro.
          </p>
          <button
            type="button"
            onClick={replayPreview}
            className="shrink-0 rounded-md border border-[var(--vb-border)] px-2.5 py-1 text-xs font-semibold text-[var(--vb-text)] hover:border-[var(--vb-accent)]"
          >
            ▶ Ver efeito
          </button>
        </div>
      </div>

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

      {onApplyToAll ? (
        <button
          type="button"
          onClick={handleApplyToAll}
          className="w-fit text-xs font-semibold text-[var(--vb-accent)] hover:underline"
        >
          {copiedToAll ? '✓ Aplicado em todas as etapas!' : 'Usar essa transição em todas as etapas'}
        </button>
      ) : null}
    </div>
  )
}
