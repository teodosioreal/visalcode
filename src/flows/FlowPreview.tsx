import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ExternalLink, Loader2, Monitor, Play, RotateCcw, Smartphone } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { FieldRenderer } from './FieldRenderer'
import { transitionStyle } from './transitionStyles'
import { resolveNextStepId, validateStep } from './validation'
import { buildFieldsById, interpolate } from './interpolate'
import type { FieldValue, FlowConfig, FlowStep } from './types'

export function FlowPreview({
  flow,
  selectedStepId,
}: {
  flow: FlowConfig
  selectedStepId: string
}) {
  const [testMode, setTestMode] = useState(false)
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [playingStepId, setPlayingStepId] = useState(flow.startStepId)
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<'from' | 'to'>('to')
  const [finished, setFinished] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const shownStepId = testMode ? playingStepId : selectedStepId
  const shownStep: FlowStep | undefined =
    flow.steps.find((s) => s.id === shownStepId) ?? flow.steps[0]

  const fieldsById = useMemo(
    () => buildFieldsById(flow.steps.map((s) => s.fields)),
    [flow.steps],
  )

  // Anima a entrada sempre que a etapa mostrada muda.
  useEffect(() => {
    setPhase('from')
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('to'))
    })
    return () => cancelAnimationFrame(raf1)
  }, [shownStepId, finished])

  useEffect(() => {
    return () => {
      clearTimeout(autoAdvanceTimer.current)
      clearTimeout(loadingTimer.current)
    }
  }, [])

  function startTest() {
    setTestMode(true)
    setPlayingStepId(flow.startStepId)
    setValues({})
    setErrors({})
    setFinished(false)
    setLoadingMessage(null)
  }

  function exitTest() {
    setTestMode(false)
    clearTimeout(autoAdvanceTimer.current)
    clearTimeout(loadingTimer.current)
    setLoadingMessage(null)
  }

  function goNext(step: FlowStep, nextValues: Record<string, FieldValue>) {
    const proceed = () => {
      const nextId = resolveNextStepId(step, nextValues)
      if (nextId && flow.steps.some((s) => s.id === nextId)) {
        setPlayingStepId(nextId)
      } else {
        setFinished(true)
      }
    }

    if (step.loading?.enabled) {
      setLoadingMessage(step.loading.message || 'Carregando...')
      setLoadingProgress(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setLoadingProgress(100)))
      loadingTimer.current = setTimeout(() => {
        setLoadingMessage(null)
        proceed()
      }, step.loading.durationMs)
    } else {
      proceed()
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

  const hasBackground =
    !!shownStep.imageUrl && (shownStep.imageMode ?? 'banner') === 'background'

  let cardNode: ReactNode

  if (testMode && loadingMessage) {
    cardNode = (
      <div className="w-full max-w-md rounded-2xl border border-[var(--vb-border)] bg-white p-8 text-center shadow-sm">
        <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
        <p className="mt-3 text-sm font-semibold text-gray-700">{loadingMessage}</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] ease-linear"
            style={{
              width: `${loadingProgress}%`,
              transitionDuration: `${shownStep.loading?.durationMs ?? 900}ms`,
            }}
          />
        </div>
      </div>
    )
  } else if (testMode && finished) {
    cardNode = (
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
    )
  } else {
    const hasBanner = !!shownStep.imageUrl && !hasBackground

    cardNode = (
      <div
        key={shownStepId}
        style={{
          ...transitionStyle(shownStep.transition, phase),
          ...(hasBackground
            ? {
                backgroundImage: `url(${shownStep.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}),
        }}
        className={
          hasBackground
            ? 'relative flex h-full w-full flex-col justify-end overflow-hidden'
            : 'relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--vb-border)] bg-white shadow-sm'
        }
      >
        {hasBanner ? (
          <img src={shownStep.imageUrl} alt="" className="h-40 w-full object-cover" />
        ) : null}
        {hasBackground ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
        ) : null}

        <div className={`relative p-8 ${hasBackground ? 'z-10' : ''}`}>
          <h3 className={`text-xl font-bold ${hasBackground ? 'text-white' : 'text-gray-900'}`}>
            {shownStep.title}
          </h3>
          {shownStep.description ? (
            <p
              className={`mt-1 whitespace-pre-wrap text-sm ${
                hasBackground ? 'text-white/85' : 'text-gray-500'
              }`}
            >
              {interpolate(shownStep.description, values, fieldsById)}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-4">
            {shownStep.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                error={testMode ? errors[field.id] : undefined}
                onChange={(value) =>
                  testMode ? handleFieldChange(shownStep, field.id, value) : undefined
                }
              />
            ))}
          </div>

          {shownStep.finalLink?.enabled ? (
            <a
              href={shownStep.finalLink.url || '#'}
              target={shownStep.finalLink.openInNewTab ? '_blank' : '_self'}
              rel={shownStep.finalLink.openInNewTab ? 'noreferrer' : undefined}
              onClick={(e) => {
                if (!testMode) {
                  e.preventDefault()
                  return
                }
                const stepErrors = validateStep(shownStep, values)
                setErrors(stepErrors)
                if (Object.keys(stepErrors).length > 0) e.preventDefault()
              }}
              className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[var(--vb-accent)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--vb-accent-strong)]"
            >
              {shownStep.finalLink.label || 'Continuar'}
              <ExternalLink size={14} />
            </a>
          ) : testMode && shownStep.validation.advanceTrigger === 'button' ? (
            <Button
              type="button"
              variant="primary"
              className="mt-6 w-full"
              onClick={() => handleNextClick(shownStep)}
            >
              {shownStep.validation.nextButtonLabel || 'Próximo'}
            </Button>
          ) : null}

          {!testMode ? (
            <p className="mt-5 rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">
              Clique em "Testar fluxo" para preencher de verdade e ver o avanço entre etapas.
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--vb-border)] px-4 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--vb-text-muted)]">
          Pré-visualização ao vivo
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[var(--vb-border)] p-0.5">
            <button
              type="button"
              title="Ver como desktop"
              onClick={() => setViewport('desktop')}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                viewport === 'desktop'
                  ? 'bg-[var(--vb-accent)] text-white'
                  : 'text-[var(--vb-text-muted)]'
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              title="Ver como celular"
              onClick={() => setViewport('mobile')}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                viewport === 'mobile'
                  ? 'bg-[var(--vb-accent)] text-white'
                  : 'text-[var(--vb-text-muted)]'
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>
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
      </div>

      <div
        className={`flex flex-1 overflow-y-auto bg-[var(--vb-bg)] ${
          hasBackground ? '' : 'items-center justify-center p-6'
        }`}
      >
        {viewport === 'mobile' ? (
          <PhoneFrame fullBleed={hasBackground}>{cardNode}</PhoneFrame>
        ) : (
          cardNode
        )}
      </div>
    </div>
  )
}

function PhoneFrame({ children, fullBleed }: { children: ReactNode; fullBleed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-[2.25rem] border-[10px] border-gray-900 bg-gray-900 shadow-xl">
        <div
          className={`relative flex h-[640px] w-[320px] flex-col overflow-y-auto rounded-[1.4rem] bg-[var(--vb-bg)] ${
            fullBleed ? '' : 'items-center justify-center p-4'
          }`}
        >
          <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/50" />
          {children}
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--vb-text-muted)]">
        Visualização em celular
      </span>
    </div>
  )
}
