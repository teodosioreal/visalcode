import type { FlowConfig } from './types'
import { defaultTransition } from './factory'

const stepTattoo = 'step-tattoo'
const stepNails = 'step-nails'
const stepShape = 'step-shape'
const stepSize = 'step-size'
const stepCare = 'step-care'
const stepDiagnostico = 'step-diagnostico'

const quickTransition = { ...defaultTransition(), type: 'fade' as const, durationMs: 300 }

/**
 * Fluxo de captação de leads com perguntas de qualificação (nichos de pés),
 * avançando sozinho a cada resposta, terminando numa etapa de "diagnóstico"
 * que resume o que a pessoa respondeu e captura o contato.
 */
export const defaultFlow: FlowConfig = {
  id: 'flow-leads-diagnostico',
  name: 'Captação de leads — diagnóstico do perfil',
  startStepId: stepTattoo,
  steps: [
    {
      id: stepTattoo,
      title: 'Você tem alguma tatuagem nos pés?',
      description: 'Ajuda a entender melhor o seu perfil.',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'tattoo',
          type: 'single-select',
          label: 'Tatuagem',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-tattoo-1', label: 'Não tenho', value: 'nao-tenho' },
            { id: 'opt-tattoo-2', label: 'Tenho uma pequena', value: 'pequena' },
            { id: 'opt-tattoo-3', label: 'Tenho várias', value: 'varias' },
            { id: 'opt-tattoo-4', label: 'Tenho, mas escondidas', value: 'escondidas' },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' },
      transition: quickTransition,
      branches: [],
      defaultNextStepId: stepNails,
    },
    {
      id: stepNails,
      title: 'Costuma pintar as unhas dos pés?',
      description: 'Informação opcional, mas ajuda no seu diagnóstico.',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'nails',
          type: 'single-select',
          label: 'Unhas',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-nails-1', label: 'Nunca', value: 'nunca' },
            { id: 'opt-nails-2', label: 'Às vezes', value: 'as-vezes' },
            { id: 'opt-nails-3', label: 'Sempre', value: 'sempre' },
            { id: 'opt-nails-4', label: 'Faço pedicure profissional', value: 'pedicure' },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' },
      transition: quickTransition,
      branches: [],
      defaultNextStepId: stepShape,
    },
    {
      id: stepShape,
      title: 'Qual o formato dos seus dedos?',
      description: '',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'shape',
          type: 'single-select',
          label: 'Formato',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-shape-1', label: 'Egípcio (decrescente)', value: 'egipcio' },
            { id: 'opt-shape-2', label: 'Grego (segundo dedo maior)', value: 'grego' },
            { id: 'opt-shape-3', label: 'Romano (3 primeiros iguais)', value: 'romano' },
            { id: 'opt-shape-4', label: 'Não sei', value: 'nao-sei' },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' },
      transition: quickTransition,
      branches: [],
      defaultNextStepId: stepSize,
    },
    {
      id: stepSize,
      title: 'Qual o tamanho do seu pé?',
      description: 'Compradores costumam filtrar por tamanho.',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'size',
          type: 'single-select',
          label: 'Tamanho',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-size-1', label: '33–35', value: '33-35' },
            { id: 'opt-size-2', label: '36–37', value: '36-37' },
            { id: 'opt-size-3', label: '38–39', value: '38-39' },
            { id: 'opt-size-4', label: '40+', value: '40-mais' },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' },
      transition: quickTransition,
      branches: [],
      defaultNextStepId: stepCare,
    },
    {
      id: stepCare,
      title: 'Como são seus cuidados com os pés?',
      description: '',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: true, message: 'Montando seu diagnóstico...', durationMs: 1200 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'care',
          type: 'single-select',
          label: 'Cuidados',
          placeholder: '',
          required: true,
          errorMessage: 'Escolha uma opção para continuar.',
          options: [
            { id: 'opt-care-1', label: 'Nenhum especial', value: 'nenhum' },
            { id: 'opt-care-2', label: 'Hidratação semanal', value: 'hidratacao' },
            { id: 'opt-care-3', label: 'Pedicure mensal', value: 'pedicure-mensal' },
            {
              id: 'opt-care-4',
              label: 'Spa, esfoliação e hidratação diária',
              value: 'spa-completo',
            },
          ],
          validation: {},
        },
      ],
      validation: { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' },
      transition: quickTransition,
      branches: [],
      defaultNextStepId: stepDiagnostico,
    },
    {
      id: stepDiagnostico,
      title: 'Seu diagnóstico está pronto! 🎉',
      description:
        'Com base no que você nos contou — tatuagem: {{tattoo}}, unhas: {{nails}}, formato dos dedos: {{shape}}, tamanho do pé: {{size}} e cuidados: {{care}} — o seu perfil tem tudo pra se destacar. Deixe seu contato abaixo que a gente te chama com os próximos passos.',
      backgroundImageUrl: '',
      cardImageUrl: '',
      loading: { enabled: false, message: 'Analisando suas respostas...', durationMs: 900 },
      finalLink: { enabled: false, url: '', label: 'Continuar', openInNewTab: true },
      fields: [
        {
          id: 'lead-nome',
          type: 'text',
          label: 'Nome completo',
          placeholder: 'Seu nome',
          required: true,
          errorMessage: 'Digite seu nome.',
          options: [],
          validation: { minLength: 2 },
        },
        {
          id: 'lead-whatsapp',
          type: 'phone',
          label: 'WhatsApp',
          placeholder: '(11) 91234-5678',
          required: true,
          errorMessage: 'Digite um WhatsApp válido.',
          options: [],
          validation: {},
        },
        {
          id: 'lead-consentimento',
          type: 'consent',
          label: 'Li e aceito a',
          placeholder: '',
          required: true,
          errorMessage: 'Você precisa aceitar para continuar.',
          options: [
            { id: 'opt-consent-privacidade', label: 'Política de Privacidade', value: '' },
            { id: 'opt-consent-termos', label: 'Termos de Uso', value: '' },
          ],
          validation: {},
        },
      ],
      validation: {
        required: true,
        advanceTrigger: 'button',
        nextButtonLabel: 'Quero minha avaliação',
      },
      transition: { ...defaultTransition(), type: 'zoom', durationMs: 400 },
      branches: [],
      defaultNextStepId: null,
    },
  ],
}
