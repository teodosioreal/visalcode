import type {
  BranchRule,
  FieldOption,
  FieldType,
  FlowConfig,
  FlowStep,
  FormField,
  TransitionConfig,
} from './types'

export function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function newId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${rand}`
}

export function defaultTransition(): TransitionConfig {
  return {
    type: 'slide-left',
    durationMs: 350,
    easing: 'ease-in-out',
    cubicBezier: [0.4, 0, 0.2, 1],
    delayMs: 0,
  }
}

export function defaultFieldOption(): FieldOption {
  return { id: newId('opt'), label: 'Opção', value: 'opcao' }
}

export function defaultConsentLinks(): FieldOption[] {
  return [
    { id: newId('opt'), label: 'Política de Privacidade', value: '' },
    { id: newId('opt'), label: 'Termos de Uso', value: '' },
  ]
}

export function defaultField(type: FieldType = 'text'): FormField {
  return {
    id: newId('field'),
    type,
    label: type === 'consent' ? 'Li e aceito a' : 'Novo campo',
    placeholder: '',
    required: true,
    errorMessage:
      type === 'consent'
        ? 'Você precisa aceitar para continuar.'
        : 'Preencha este campo para continuar.',
    options:
      type === 'single-select' || type === 'multi-select'
        ? [defaultFieldOption()]
        : type === 'consent'
          ? defaultConsentLinks()
          : [],
    validation: {},
  }
}

export function defaultBranch(goToStepId: string): BranchRule {
  return {
    id: newId('branch'),
    whenFieldId: '',
    operator: 'equals',
    value: '',
    goToStepId,
  }
}

export function newStep(title = 'Nova etapa'): FlowStep {
  return {
    id: newId('step'),
    title,
    description: '',
    imageUrl: '',
    imageMode: 'banner',
    loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
    finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
    fields: [defaultField()],
    validation: { required: true, advanceTrigger: 'button', nextButtonLabel: 'Próximo' },
    transition: defaultTransition(),
    branches: [],
    defaultNextStepId: null,
  }
}

export function newFlow(name = 'Novo fluxo'): FlowConfig {
  const step = newStep('Etapa 1')
  return {
    id: newId('flow'),
    name,
    startStepId: step.id,
    steps: [step],
  }
}
