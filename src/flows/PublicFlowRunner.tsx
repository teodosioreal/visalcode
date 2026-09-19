import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ExternalLink, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { FieldRenderer } from './FieldRenderer'
import { transitionStyle } from './transitionStyles'
import { resolveNextStepId, validateStep } from './validation'
import { buildFieldsById, interpolate } from './interpolate'
import { buildWebhookPayload, sendWebhook } from './webhook'
import { migrateFlow } from './factory'
import type { FieldValue, FlowConfig, FlowStep } from './types'

const STORAGE_KEY = 'vb:flow-data'

function loadFlow(): FlowConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? migrateFlow(JSON.parse(raw) as FlowConfig) : null
  } catch {
    return null
  }
}

/**
 * Página pública do fluxo — sem nada do editor (abas, painéis, botão de
 * "testar"): é exatamente isso que se publica pra visitantes de verdade
 * preencherem. Lê o mesmo fluxo salvo/editado na aba "Fluxos".
 */
export function PublicFlowRunner() {
  const [flow, setFlow] = useState<FlowConfig | null | undefined>(undefined)
  const [history, setHistory] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<'from' | 'to'>('to')
  const [finished, setFinished] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const loaded = loadFlow()
    setFlow(loaded)
    if (loaded) setHistory([loaded.startStepId])
  }, [])

  const fieldsById = useMemo(
    () => (flow ? buildFieldsById(flow.steps.map((s) => s.fields)) : new Map()),
    [flow],
  )

  const currentStepId = history[history.length - 1]
  const currentStep: FlowStep | undefined = flow?.steps.find((s) => s.id === currentStepId)

  useEffect(() => {
    setPhase('from')
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('to'))
    })
    return () => cancelAnimationFrame(raf1)
  }, [currentStepId, finished])

  useEffect(() => {
    return () => {
      clearTimeout(autoAdvanceTimer.current)
      clearTimeout(loadingTimer.current)
    }
  }, [])

  function notifyWebhookOnCompletion(
    nextValues: Record<string, FieldValue>,
    opts?: { keepalive?: boolean },
  ) {
    if (!flow?.webhook?.enabled || !flow.webhook.url) return
    const payload = buildWebhookPayload(flow, nextValues, fieldsById)
    sendWebhook(flow.webhook.url, payload, opts).catch(() => {})
  }

  function goNext(step: FlowStep, nextValues: Record<string, FieldValue>) {
    const proceed = () => {
      const nextId = resolveNextStepId(step, nextValues)
      if (nextId && flow?.steps.some((s) => s.id === nextId)) {
        setHistory((h) => [...h, nextId])
      } else {
        setFinished(true)
        notifyWebhookOnCompletion(nextValues)
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

  function handleBack() {
    if (history.length <= 1) return
    clearTimeout(autoAdvanceTimer.current)
    clearTimeout(loadingTimer.current)
    setLoadingMessage(null)
    setFinished(false)
    setHistory((h) => h.slice(0, -1))
  }

  function handleRestart() {
    if (!flow) return
    setHistory([flow.startStepId])
    setValues({})
    setErrors({})
    setFinished(false)
    setLoadingMessage(null)
  }

  if (flow === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--vb-bg)] text-sm text-[var(--vb-text-muted)]">
        Carregando…
      </div>
    )
  }

  if (!flow || !currentStep) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-1.5 bg-[var(--vb-bg)] px-6 text-center">
        <p className="text-sm font-semibold text-[var(--vb-text)]">
          Nenhum formulário publicado ainda.
        </p>
        <p className="text-xs text-[var(--vb-text-muted)]">
          Configure um fluxo na aba "Fluxos" primeiro.
        </p>
      </div>
    )
  }

  const hasBackground = !!currentStep.backgroundImageUrl
  const hasCardImage = !!currentStep.cardImageUrl
  const showingTransientCard = !!loadingMessage || finished
  const fullBleed = hasBackground && !showingTransientCard
  const canGoBack = history.length > 1 && !showingTransientCard
  const progressPercent = Math.min(
    100,
    Math.round(((history.length - 1) / Math.max(1, flow.steps.length - 1)) * 100),
  )

  let cardNode: ReactNode

  if (loadingMessage) {
    cardNode = (
      <div className="w-full max-w-md rounded-2xl border border-[var(--vb-border)] bg-white p-8 text-center shadow-sm">
        <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
        <p className="mt-3 text-sm font-semibold text-gray-700">{loadingMessage}</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] ease-linear"
            style={{
              width: `${loadingProgress}%`,
              transitionDuration: `${currentStep.loading?.durationMs ?? 900}ms`,
            }}
          />
        </div>
      </div>
    )
  } else if (finished) {
    cardNode = (
      <div
        style={transitionStyle(currentStep.transition, phase)}
        className="w-full max-w-md rounded-2xl border border-[var(--vb-border)] bg-white p-8 text-center shadow-sm"
      >
        <p className="text-lg font-bold text-gray-900">Tudo certo! 🎉</p>
        <p className="mt-1 text-sm text-gray-500">Recebemos suas respostas, obrigado.</p>
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={handleRestart}>
          <RotateCcw size={14} />
          Preencher de novo
        </Button>
      </div>
    )
  } else {
    cardNode = (
      <div
        key={currentStepId}
        style={{
          ...transitionStyle(currentStep.transition, phase),
          ...(hasBackground
            ? {
                backgroundImage: `url(${currentStep.backgroundImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}),
        }}
        className={
          hasBackground
            ? 'relative flex min-h-screen w-full flex-col justify-end overflow-x-hidden'
            : 'relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--vb-border)] bg-white shadow-sm'
        }
      >
        {hasCardImage ? (
          <img
            src={currentStep.cardImageUrl}
            alt=""
            className={`h-40 w-full object-cover ${hasBackground ? 'relative z-10' : ''}`}
          />
        ) : null}
        {hasBackground ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
        ) : null}

        <div className={`relative p-8 ${hasBackground ? 'z-10' : ''}`}>
          <h3 className={`text-xl font-bold ${hasBackground ? 'text-white' : 'text-gray-900'}`}>
            {currentStep.title}
          </h3>
          {currentStep.description ? (
            <p
              className={`mt-1 whitespace-pre-wrap text-sm ${
                hasBackground ? 'text-white/85' : 'text-gray-500'
              }`}
            >
              {interpolate(currentStep.description, values, fieldsById)}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-4">
            {currentStep.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                error={errors[field.id]}
                onChange={(value) => handleFieldChange(currentStep, field.id, value)}
              />
            ))}
          </div>

          {currentStep.finalLink?.enabled ? (
            <a
              href={currentStep.finalLink.url || '#'}
              target={currentStep.finalLink.openInNewTab ? '_blank' : '_self'}
              rel={currentStep.finalLink.openInNewTab ? 'noreferrer' : undefined}
              onClick={(e) => {
                const stepErrors = validateStep(currentStep, values)
                setErrors(stepErrors)
                if (Object.keys(stepErrors).length > 0) {
                  e.preventDefault()
                } else {
                  notifyWebhookOnCompletion(values, {
                    keepalive: !currentStep.finalLink?.openInNewTab,
                  })
                }
              }}
              className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--vb-accent)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--vb-accent-strong)]`}
            >
              {currentStep.finalLink.label || 'Continuar'}
              <ExternalLink size={14} />
            </a>
          ) : currentStep.validation.advanceTrigger === 'button' ? (
            <Button
              type="button"
              variant="primary"
              className="mt-6 h-11 w-full"
              onClick={() => handleNextClick(currentStep)}
            >
              {currentStep.validation.nextButtonLabel || 'Próximo'}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[var(--vb-bg)]">
      <div className="fixed inset-x-0 top-0 z-30 h-1 bg-black/5">
        <div
          className="h-full bg-[var(--vb-accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {canGoBack ? (
        <button
          type="button"
          onClick={handleBack}
          title="Voltar"
          className={`fixed left-3 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
            hasBackground
              ? 'bg-black/30 text-white hover:bg-black/45'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={18} />
        </button>
      ) : null}

      <div
        className={`flex min-h-screen w-full ${
          fullBleed ? '' : 'items-center justify-center p-6'
        }`}
      >
        {cardNode}
      </div>
    </div>
  )
}
