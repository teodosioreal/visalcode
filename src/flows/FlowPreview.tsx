import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { FieldRenderer } from './FieldRenderer'
import { transitionStyle } from './transitionStyles'
import { resolveNextStepId, validateStep } from './validation'
import type { FieldValue, FlowConfig, FlowStep } from './types'

export function FlowPreview({
  flow,
  selectedStepId,
}: {
  flow: FlowConfig
  selectedStepId: string
}) {
  const [testMode, setTestMode] = useState(false)
  const [playingStepId, setPlayingStepId] = useState(flow.startStepId)
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<'from' | 'to'>('to')
  const [finished, setFinished] = useState(false)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const shownStepId = testMode ? playingStepId : selectedStepId
  const shownStep: FlowStep | undefined =
    flow.steps.find((s) => s.id === shownStepId) ?? flow.steps[0]

  // Anima a entrada sempre que a etapa mostrada muda.
  useEffect(() => {
    setPhase('from')
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('to'))
    })
    return () => cancelAnimationFrame(raf1)
  }, [shownStepId, finished])

  useEffect(() => () => clearTimeout(autoAdvanceTimer.current), [])

  function startTest() {
    setTestMode(true)
    setPlayingStepId(flow.startStepId)
    setValues({})
    setErrors({})
    setFinished(false)
  }

  function exitTest() {
    setTestMode(false)
    clearTimeout(autoAdvanceTimer.current)
  }

  function goNext(step: FlowStep, nextValues: Record<string, FieldValue>) {
    const nextId = resolveNextStepId(step, nextValues)
    if (nextId && flow.steps.some((s) => s.id === nextId)) {
      setPlayingStepId(nextId)
    } else {
      setFinished(true)
    }
  }

  function handleFieldChange(step: FlowStep, fieldId: string, value: FieldValue) {
    const nextValues = { ...values, [fieldId]: value }
    setValues(nextValues)
    setErrors((prev) => ({ ...prev, [fieldId]: '' }))

    if (step.validation.advanceTrigger === 'auto') {
      const stepErrors = validateStep(step, nextValues)
      if (Object.keys(stepErrors).length === 0) {
        clearTimeout(autoAdvanceTimer.current)
        autoAdvanceTimer.current = setTimeout(() => goNext(step, nextValues), 220)
      }
    }
  }

  function handleNextClick(step: FlowStep) {
    const stepErrors = validateStep(step, values)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length === 0) goNext(step, values)
  }

  if (!shownStep) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--vb-text-muted)]">
        Nenhuma etapa para mostrar.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--vb-border)] px-4 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--vb-text-muted)]">
          Pré-visualização ao vivo
        </h2>
        {testMode ? (
          <Button type="button" variant="secondary" size="sm" onClick={exitTest}>
            <RotateCcw size={14} />
            Sair do teste
          </Button>
        ) : (
          <Button type="button" variant="primary" size="sm" onClick={startTest}>
            <Play size={14} />
            Testar fluxo
          </Button>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[var(--vb-bg)] p-6">
        {testMode && finished ? (
          <div
            style={transitionStyle(shownStep.transition, phase)}
            className="w-full max-w-md rounded-2xl border border-[var(--vb-border)] bg-white p-8 text-center shadow-sm"
          >
            <p className="text-lg font-bold text-gray-900">Fim do fluxo 🎉</p>
            <p className="mt-1 text-sm text-gray-500">
              Foi assim que alguém preenchendo de verdade chegaria até aqui.
            </p>
            <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={startTest}>
              <RotateCcw size={14} />
              Testar de novo
            </Button>
          </div>
        ) : (
          <div
            key={shownStepId}
            style={transitionStyle(shownStep.transition, phase)}
            className="w-full max-w-md rounded-2xl border border-[var(--vb-border)] bg-white p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-gray-900">{shownStep.title}</h3>
            {shownStep.description ? (
              <p className="mt-1 text-sm text-gray-500">{shownStep.description}</p>
            ) : null}

            <div className="mt-5 flex flex-col gap-4">
              {shownStep.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={testMode ? errors[field.id] : undefined}
                  onChange={(value) =>
                    testMode
                      ? handleFieldChange(shownStep, field.id, value)
                      : undefined
                  }
                />
              ))}
            </div>

            {testMode && shownStep.validation.advanceTrigger === 'button' ? (
              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full"
                onClick={() => handleNextClick(shownStep)}
              >
                Próximo
              </Button>
            ) : null}

            {!testMode ? (
              <p className="mt-5 rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">
                Clique em "Testar fluxo" para preencher de verdade e ver o avanço entre etapas.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
