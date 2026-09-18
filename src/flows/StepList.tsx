import { ArrowDown, ArrowUp, Copy, Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'
import type { FlowConfig, FlowStep } from './types'

export function StepList({
  flow,
  selectedStepId,
  onSelect,
  onAdd,
  onRemove,
  onDuplicate,
  onMove,
  onSetStart,
}: {
  flow: FlowConfig
  selectedStepId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onSetStart: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--vb-text-muted)]">
          Etapas
        </h2>
        <Button type="button" variant="primary" size="sm" onClick={onAdd}>
          <Plus size={14} />
          Nova
        </Button>
      </div>

      <ol className="flex flex-col gap-1.5">
        {flow.steps.map((step: FlowStep, index: number) => {
          const isSelected = step.id === selectedStepId
          const isStart = step.id === flow.startStepId
          return (
            <li key={step.id}>
              <div
                className={cn(
                  'group flex flex-col gap-1.5 rounded-lg border px-2.5 py-2 transition-colors',
                  isSelected
                    ? 'border-[var(--vb-accent)] bg-[var(--vb-accent)]/10'
                    : 'border-[var(--vb-border)] bg-[var(--vb-surface-1)] hover:bg-[var(--vb-surface-2)]',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(step.id)}
                  className="flex items-center gap-2 text-left"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--vb-surface-3)] text-[10px] font-bold text-[var(--vb-text)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--vb-text)]">
                    {step.title || 'Sem título'}
                  </span>
                  {isStart ? (
                    <Play size={11} className="shrink-0 text-emerald-500" />
                  ) : null}
                </button>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconAction title="Mover para cima" onClick={() => onMove(step.id, 'up')}>
                    <ArrowUp size={13} />
                  </IconAction>
                  <IconAction title="Mover para baixo" onClick={() => onMove(step.id, 'down')}>
                    <ArrowDown size={13} />
                  </IconAction>
                  <IconAction title="Duplicar etapa" onClick={() => onDuplicate(step.id)}>
                    <Copy size={13} />
                  </IconAction>
                  {!isStart ? (
                    <IconAction title="Definir como etapa inicial" onClick={() => onSetStart(step.id)}>
                      <Play size={13} />
                    </IconAction>
                  ) : null}
                  {flow.steps.length > 1 ? (
                    <IconAction
                      title="Excluir etapa"
                      danger
                      onClick={() => onRemove(step.id)}
                    >
                      <Trash2 size={13} />
                    </IconAction>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function IconAction({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md text-[var(--vb-text-muted)] hover:bg-[var(--vb-surface-3)]',
        danger && 'hover:text-red-500',
      )}
    >
      {children}
    </button>
  )
}
