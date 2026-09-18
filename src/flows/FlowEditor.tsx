import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import fileSaver from 'file-saver'
import { FlowsTopBar } from './FlowsTopBar'
import { StepList } from './StepList'
import { StepPropertiesPanel } from './StepPropertiesPanel'
import { FlowPreview } from './FlowPreview'
import { JsonView } from './JsonView'
import { defaultFlow } from './defaultFlow'
import { newId, newStep } from './factory'
import type { FlowConfig, FlowStep } from './types'

const { saveAs } = fileSaver

const STORAGE_KEY = 'vb:flow-data'

function loadStoredFlow(): FlowConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FlowConfig) : null
  } catch {
    return null
  }
}

function parseUpdatedAt(flow: FlowConfig): Date | null {
  if (!flow.updatedAt) return null
  const date = new Date(flow.updatedAt)
  return Number.isNaN(date.getTime()) ? null : date
}

function cloneStepWithNewIds(step: FlowStep): FlowStep {
  const idMap = new Map<string, string>()
  const fields = step.fields.map((f) => {
    const id = newId('field')
    idMap.set(f.id, id)
    return { ...f, id, options: f.options.map((o) => ({ ...o, id: newId('opt') })) }
  })
  return {
    ...step,
    id: newId('step'),
    title: `${step.title} (cópia)`,
    fields,
    branches: step.branches.map((b) => ({
      ...b,
      id: newId('branch'),
      whenFieldId: idMap.get(b.whenFieldId) ?? b.whenFieldId,
    })),
  }
}

/** Remove qualquer referência de branching/próxima-etapa que apontava pro id removido. */
function stripStepReferences(steps: FlowStep[], removedId: string): FlowStep[] {
  return steps.map((s) => ({
    ...s,
    defaultNextStepId: s.defaultNextStepId === removedId ? null : s.defaultNextStepId,
    branches: s.branches.filter((b) => b.goToStepId !== removedId),
  }))
}

export function FlowEditor() {
  const [mounted, setMounted] = useState(false)
  const [flow, setFlow] = useState<FlowConfig>(defaultFlow)
  const [selectedStepId, setSelectedStepId] = useState(defaultFlow.startStepId)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [jsonOpen, setJsonOpen] = useState(false)
  const flowRef = useRef(flow)

  useEffect(() => {
    const stored = loadStoredFlow()
    const initial = stored ?? defaultFlow
    setFlow(initial)
    flowRef.current = initial
    setSelectedStepId(initial.steps[0]?.id ?? initial.startStepId)
    setLastSavedAt(parseUpdatedAt(initial))
    setMounted(true)
  }, [])

  const persist = useCallback((next: FlowConfig) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() }
    flowRef.current = stamped
    setFlow(stamped)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped))
    setLastSavedAt(parseUpdatedAt(stamped))
  }, [])

  const selectedStep = useMemo(
    () => flow.steps.find((s) => s.id === selectedStepId) ?? flow.steps[0],
    [flow.steps, selectedStepId],
  )

  function updateSelectedStep(patch: Partial<FlowStep>) {
    if (!selectedStep) return
    persist({
      ...flow,
      steps: flow.steps.map((s) => (s.id === selectedStep.id ? { ...s, ...patch } : s)),
    })
  }

  function handleAddStep() {
    const step = newStep(`Etapa ${flow.steps.length + 1}`)
    persist({ ...flow, steps: [...flow.steps, step] })
    setSelectedStepId(step.id)
  }

  function handleRemoveStep(id: string) {
    if (flow.steps.length <= 1) return
    const remaining = stripStepReferences(
      flow.steps.filter((s) => s.id !== id),
      id,
    )
    const startStepId = flow.startStepId === id ? remaining[0].id : flow.startStepId
    persist({ ...flow, steps: remaining, startStepId })
    if (selectedStepId === id) setSelectedStepId(remaining[0].id)
  }

  function handleDuplicateStep(id: string) {
    const step = flow.steps.find((s) => s.id === id)
    if (!step) return
    const copy = cloneStepWithNewIds(step)
    const index = flow.steps.findIndex((s) => s.id === id)
    const steps = [...flow.steps]
    steps.splice(index + 1, 0, copy)
    persist({ ...flow, steps })
    setSelectedStepId(copy.id)
  }

  function handleMoveStep(id: string, direction: 'up' | 'down') {
    const index = flow.steps.findIndex((s) => s.id === id)
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= flow.steps.length) return
    const steps = [...flow.steps]
    ;[steps[index], steps[target]] = [steps[target], steps[index]]
    persist({ ...flow, steps })
  }

  function handleSetStart(id: string) {
    persist({ ...flow, startStepId: id })
  }

  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as FlowConfig
        if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
          throw new Error('Arquivo sem etapas válidas.')
        }
        persist(parsed)
        setSelectedStepId(parsed.steps[0].id)
      } catch {
        window.alert('Não foi possível importar: o arquivo não é um fluxo válido.')
      }
    }
    reader.readAsText(file)
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(flowRef.current, null, 2)], {
      type: 'application/json',
    })
    saveAs(blob, `${(flow.name || 'fluxo').toLowerCase().replace(/\s+/g, '-')}.json`)
  }

  if (!mounted || !selectedStep) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--vb-bg)] text-sm text-[var(--vb-text-muted)]">
        Carregando editor de fluxos…
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FlowsTopBar
        flowName={flow.name}
        lastSavedAt={lastSavedAt}
        onOpenJson={() => setJsonOpen(true)}
        onImport={handleImport}
        onDownload={handleDownload}
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_1fr_360px]">
        <div className="hidden border-r border-[var(--vb-border)] bg-[var(--vb-surface-1)] md:block">
          <StepList
            flow={flow}
            selectedStepId={selectedStep.id}
            onSelect={setSelectedStepId}
            onAdd={handleAddStep}
            onRemove={handleRemoveStep}
            onDuplicate={handleDuplicateStep}
            onMove={handleMoveStep}
            onSetStart={handleSetStart}
          />
        </div>
        <div className="min-h-0 min-w-0">
          <FlowPreview flow={flow} selectedStepId={selectedStep.id} />
        </div>
        <div className="hidden min-h-0 border-l border-[var(--vb-border)] bg-[var(--vb-surface-1)] md:block">
          <StepPropertiesPanel
            step={selectedStep}
            allSteps={flow.steps}
            onChange={updateSelectedStep}
          />
        </div>
      </div>
      <JsonView open={jsonOpen} onClose={() => setJsonOpen(false)} flow={flow} onApply={persist} />
    </div>
  )
}
