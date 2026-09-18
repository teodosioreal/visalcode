import { Plus, Trash2 } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import { defaultBranch } from '../factory'
import type { BranchOperator, BranchRule, FlowStep } from '../types'

const OPERATOR_OPTIONS: Array<{ value: BranchOperator; label: string }> = [
  { value: 'equals', label: 'é igual a' },
  { value: 'not-equals', label: 'é diferente de' },
  { value: 'contains', label: 'contém' },
  { value: 'greater-than', label: 'é maior que' },
  { value: 'less-than', label: 'é menor que' },
]

export function BranchingSection({
  step,
  allSteps,
  onChange,
}: {
  step: FlowStep
  allSteps: FlowStep[]
  onChange: (patch: Partial<FlowStep>) => void
}) {
  const otherSteps = allSteps.filter((s) => s.id !== step.id)

  function updateBranch(id: string, patch: Partial<BranchRule>) {
    onChange({
      branches: step.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })
  }

  function addBranch() {
    onChange({ branches: [...step.branches, defaultBranch(otherSteps[0]?.id ?? '')] })
  }

  function removeBranch(id: string) {
    onChange({ branches: step.branches.filter((b) => b.id !== id) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Regras de ramificação (se... então vá para...)</Label>
        <button
          type="button"
          onClick={addBranch}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--vb-accent)] hover:underline"
        >
          <Plus size={13} />
          Regra
        </button>
      </div>

      {step.fields.length === 0 ? (
        <p className="text-xs text-[var(--vb-text-muted)]">
          Adicione um campo nesta etapa para poder criar regras baseadas na resposta.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {step.branches.map((branch) => (
          <div
            key={branch.id}
            className="flex flex-col gap-1.5 rounded-lg border border-[var(--vb-border)] p-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs">
              <span className="shrink-0 font-semibold text-[var(--vb-text-muted)]">Se</span>
              <Select
                value={branch.whenFieldId}
                onChange={(e) => updateBranch(branch.id, { whenFieldId: e.target.value })}
              >
                <option value="">campo…</option>
                {step.fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label || f.id}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Select
                className="shrink-0"
                value={branch.operator}
                onChange={(e) =>
                  updateBranch(branch.id, { operator: e.target.value as BranchOperator })
                }
              >
                {OPERATOR_OPTIONS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="valor"
                value={branch.value}
                onChange={(e) => updateBranch(branch.id, { value: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="shrink-0 font-semibold text-[var(--vb-text-muted)]">vá para</span>
              <Select
                value={branch.goToStepId}
                onChange={(e) => updateBranch(branch.id, { goToStepId: e.target.value })}
              >
                <option value="">etapa…</option>
                {otherSteps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || s.id}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => removeBranch(branch.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--vb-text-muted)] hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label>Se nenhuma regra combinar, avançar para</Label>
        <Select
          value={step.defaultNextStepId ?? ''}
          onChange={(e) => onChange({ defaultNextStepId: e.target.value || null })}
        >
          <option value="">Fim do formulário</option>
          {otherSteps.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title || s.id}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
