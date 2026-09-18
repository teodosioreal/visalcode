export type TransitionType =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'step-up'
  | 'zoom'
  | 'none'

export type Easing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier'

export type TransitionConfig = {
  type: TransitionType
  /** Duração da transição, em milissegundos. */
  durationMs: number
  easing: Easing
  /** Usado só quando easing === 'cubic-bezier'. */
  cubicBezier: [number, number, number, number]
  /** Atraso antes de iniciar a transição, em milissegundos. */
  delayMs: number
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'single-select'
  | 'multi-select'
  | 'file'

export type FieldOption = { id: string; label: string; value: string }

/** Valor preenchido pelo usuário na pré-visualização: texto único ou lista (multi-seleção). */
export type FieldValue = string | string[]

export type FieldValidation = {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

export type FormField = {
  id: string
  type: FieldType
  label: string
  placeholder: string
  required: boolean
  errorMessage: string
  options: FieldOption[]
  validation: FieldValidation
}

/** Como a etapa avança: sozinha ao preencher/selecionar, ou só com clique em "Próximo". */
export type AdvanceTrigger = 'auto' | 'button'

export type StepValidation = {
  required: boolean
  advanceTrigger: AdvanceTrigger
  /** Texto do botão de avançar, quando advanceTrigger === 'button'. */
  nextButtonLabel: string
}

export type BranchOperator = 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than'

export type BranchRule = {
  id: string
  whenFieldId: string
  operator: BranchOperator
  value: string
  goToStepId: string
}

export type FlowStep = {
  id: string
  title: string
  description: string
  /** URL de uma imagem/ilustração mostrada no topo da etapa. Opcional. */
  imageUrl: string
  fields: FormField[]
  validation: StepValidation
  transition: TransitionConfig
  branches: BranchRule[]
  /** Próxima etapa quando nenhuma regra de branching bate. null = fim do fluxo. */
  defaultNextStepId: string | null
}

export type FlowConfig = {
  id: string
  name: string
  updatedAt?: string
  startStepId: string
  steps: FlowStep[]
}
