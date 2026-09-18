import type { FlowConfig } from './types'
import { defaultTransition } from './factory'

const stepObjetivo = 'step-objetivo'
const stepComprador = 'step-comprador'
const stepVendedor = 'step-vendedor'
const stepFim = 'step-fim'

const fieldObjetivo = 'field-objetivo'

/** Fluxo de exemplo pra já mostrar branching, validação e transições funcionando. */
export const defaultFlow: FlowConfig = {
  id: 'flow-exemplo',
  name: 'Fluxo de exemplo',
  startStepId: stepObjetivo,
  steps: [
    {
      id: stepObjetivo,
      title: 'Qual é o seu objetivo?',
      description: 'Escolha uma opção para continuar.',
      fields: [
        {
          id: fieldObjetivo,
          type: 'single-select',
          label: 'Você quer...',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-comprar', label: 'Comprar um produto', value: 'comprar' },
            { id: 'opt-vender', label: 'Vender um produto', value: 'vender' },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto' },
      transition: { ...defaultTransition(), type: 'fade', durationMs: 250 },
      branches: [
        {
          id: 'branch-comprar',
          whenFieldId: fieldObjetivo,
          operator: 'equals',
          value: 'comprar',
          goToStepId: stepComprador,
        },
        {
          id: 'branch-vender',
          whenFieldId: fieldObjetivo,
          operator: 'equals',
          value: 'vender',
          goToStepId: stepVendedor,
        },
      ],
      defaultNextStepId: stepComprador,
    },
    {
      id: stepComprador,
      title: 'Seus dados',
      description: 'Pra gente te avisar quando encontrar a oferta certa.',
      fields: [
        {
          id: 'field-nome',
          type: 'text',
          label: 'Nome completo',
          placeholder: 'Seu nome',
          required: true,
          errorMessage: 'Digite seu nome.',
          options: [],
          validation: { minLength: 2 },
        },
        {
          id: 'field-email',
          type: 'email',
          label: 'E-mail',
          placeholder: 'voce@email.com',
          required: true,
          errorMessage: 'Digite um e-mail válido.',
          options: [],
          validation: { pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
        },
      ],
      validation: { required: true, advanceTrigger: 'button' },
      transition: { ...defaultTransition(), type: 'slide-left' },
      branches: [],
      defaultNextStepId: stepFim,
    },
    {
      id: stepVendedor,
      title: 'Sobre o produto',
      description: 'Conte um pouco do que você quer vender.',
      fields: [
        {
          id: 'field-produto',
          type: 'text',
          label: 'Nome do produto',
          placeholder: 'Ex: iPhone 13',
          required: true,
          errorMessage: 'Digite o nome do produto.',
          options: [],
          validation: {},
        },
        {
          id: 'field-preco',
          type: 'number',
          label: 'Preço desejado (R$)',
          placeholder: '0,00',
          required: true,
          errorMessage: 'Digite um preço.',
          options: [],
          validation: { min: 0 },
        },
      ],
      validation: { required: true, advanceTrigger: 'button' },
      transition: { ...defaultTransition(), type: 'slide-right' },
      branches: [],
      defaultNextStepId: stepFim,
    },
    {
      id: stepFim,
      title: 'Tudo certo!',
      description: 'Recebemos suas informações. Obrigado!',
      fields: [],
      validation: { required: false, advanceTrigger: 'button' },
      transition: { ...defaultTransition(), type: 'zoom' },
      branches: [],
      defaultNextStepId: null,
    },
  ],
}
