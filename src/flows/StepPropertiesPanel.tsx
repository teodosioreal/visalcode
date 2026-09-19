import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Input, Textarea } from '../components/ui/Input'
import { ImageField } from '../components/ui/ImageField'
import { Label } from '../components/ui/Label'
import { Button } from '../components/ui/Button'
import { TransitionSection } from './panels/TransitionSection'
import { LoadingSection } from './panels/LoadingSection'
import { ValidationSection } from './panels/ValidationSection'
import { FieldsSection } from './panels/FieldsSection'
import { BranchingSection } from './panels/BranchingSection'
import { FinalLinkSection } from './panels/FinalLinkSection'
import type { FlowStep } from './types'

const DEFAULT_LOADING = { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 }
const DEFAULT_FINAL_LINK = { enabled: false, url: '', label: 'Continuar', openInNewTab: true }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--vb-border)] p-4 last:border-b-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--vb-text-muted)]">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function StepPropertiesPanel({
  step,
  allSteps,
  onChange,
  onApply,
  onApplyTransitionToAll,
}: {
  step: FlowStep
  allSteps: FlowStep[]
  onChange: (patch: Partial<FlowStep>) => void
  onApply: () => void
  onApplyTransitionToAll: (transition: FlowStep['transition']) => void
}) {
  const [applied, setApplied] = useState(false)
  const appliedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(appliedTimer.current)
  }, [])

  function handleApplyClick() {
    onApply()
    setApplied(true)
    clearTimeout(appliedTimer.current)
    appliedTimer.current = setTimeout(() => setApplied(false), 1600)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-4 py-2.5">
        <p className="min-w-0 truncate text-[11px] text-[var(--vb-text-muted)]">
          Salvo automaticamente
        </p>
        <Button
          type="button"
          variant={applied ? 'secondary' : 'primary'}
          size="sm"
          className="shrink-0 whitespace-nowrap"
          onClick={handleApplyClick}
        >
          {applied ? <Check size={14} /> : null}
          {applied ? 'Aplicado!' : 'Aplicar alterações'}
        </Button>
      </div>

      <Section title="Etapa">
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="step-title">Título</Label>
            <Input
              id="step-title"
              value={step.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="step-desc">
              Descrição (opcional) — use {'{{id-do-campo}}'} pra citar uma resposta anterior
            </Label>
            <Textarea
              id="step-desc"
              rows={3}
              value={step.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="step-bg-image">Imagem de fundo (opcional)</Label>
            <ImageField
              id="step-bg-image"
              value={step.backgroundImageUrl}
              onChange={(backgroundImageUrl) => onChange({ backgroundImageUrl })}
            />
            <p className="mt-1 text-[11px] text-[var(--vb-text-muted)]">
              Cobre a etapa inteira, com uma sombra escura pra manter o texto legível.
            </p>
          </div>
          <div>
            <Label htmlFor="step-card-image">Imagem no cartão (opcional)</Label>
            <ImageField
              id="step-card-image"
              value={step.cardImageUrl}
              onChange={(cardImageUrl) => onChange({ cardImageUrl })}
            />
            <p className="mt-1 text-[11px] text-[var(--vb-text-muted)]">
              Aparece como um banner dentro do cartão, acima do título — pode usar junto com a
              imagem de fundo, ou sozinha.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Efeito e tempo de transição">
        <TransitionSection
          value={step.transition}
          onChange={(transition) => onChange({ transition })}
          onApplyToAll={
            allSteps.length > 1 ? () => onApplyTransitionToAll(step.transition) : undefined
          }
        />
      </Section>

      <Section title="Carregamento entre etapas">
        <LoadingSection
          value={step.loading ?? DEFAULT_LOADING}
          onChange={(loading) => onChange({ loading })}
        />
      </Section>

      <Section title="Regras e validação">
        <ValidationSection
          value={step.validation}
          onChange={(validation) => onChange({ validation })}
        />
      </Section>

      <Section title="Campos">
        <FieldsSection fields={step.fields} onChange={(fields) => onChange({ fields })} />
      </Section>

      <Section title="Ramificação (branching)">
        <BranchingSection step={step} allSteps={allSteps} onChange={onChange} />
      </Section>

      <Section title="Link final (fim do fluxo)">
        <FinalLinkSection
          value={step.finalLink ?? DEFAULT_FINAL_LINK}
          onChange={(finalLink) => onChange({ finalLink })}
        />
      </Section>
    </div>
  )
}
