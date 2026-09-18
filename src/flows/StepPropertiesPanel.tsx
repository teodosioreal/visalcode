import { Input, Textarea } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { TransitionSection } from './panels/TransitionSection'
import { ValidationSection } from './panels/ValidationSection'
import { FieldsSection } from './panels/FieldsSection'
import { BranchingSection } from './panels/BranchingSection'
import type { FlowStep } from './types'

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
}: {
  step: FlowStep
  allSteps: FlowStep[]
  onChange: (patch: Partial<FlowStep>) => void
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
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
            <Label htmlFor="step-desc">Descrição (opcional)</Label>
            <Textarea
              id="step-desc"
              rows={2}
              value={step.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
        </div>
      </Section>

      <Section title="Efeito e tempo de transição">
        <TransitionSection
          value={step.transition}
          onChange={(transition) => onChange({ transition })}
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
    </div>
  )
}
