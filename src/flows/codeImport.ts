import * as acorn from 'acorn'
import { defaultField, defaultFieldOption, newId, newStep, slug } from './factory'
import type { FlowStep } from './types'

export type CodeArrayItem = Record<string, unknown>

export type CodeImportCandidate = {
  /** Nome da variável no código, ex: "quiz". */
  name: string
  items: CodeArrayItem[]
  /** Todas as chaves usadas nos itens, pra montar os selects de mapeamento. */
  keys: string[]
}

const QUESTION_KEY_GUESSES = ['question', 'title', 'label', 'text', 'pergunta', 'titulo']
const SUBTITLE_KEY_GUESSES = ['subtitle', 'description', 'desc', 'subtitulo', 'descricao']
const OPTIONS_KEY_GUESSES = ['options', 'choices', 'answers', 'opcoes', 'alternativas']
const IMAGE_KEY_GUESSES = ['image', 'img', 'photo', 'imageurl', 'foto', 'imagem', 'picture']

export function guessKey(keys: string[], candidates: string[]): string {
  const lower = keys.map((k) => k.toLowerCase())
  for (const guess of candidates) {
    const index = lower.indexOf(guess)
    if (index !== -1) return keys[index]
  }
  return ''
}

export function guessMapping(keys: string[]) {
  return {
    questionKey: guessKey(keys, QUESTION_KEY_GUESSES),
    subtitleKey: guessKey(keys, SUBTITLE_KEY_GUESSES),
    optionsKey: guessKey(keys, OPTIONS_KEY_GUESSES),
    imageKey: guessKey(keys, IMAGE_KEY_GUESSES),
  }
}

/** Localiza declarações `const/let/var/export const <nome> = [ ... ]` no nível
 * superior do arquivo, sem precisar entender TypeScript/JSX do resto do
 * código — só pega o texto do array em si (bracket matching, ignorando
 * colchetes dentro de strings/comentários). */
function findArrayDeclarations(source: string): Array<{ name: string; raw: string }> {
  const results: Array<{ name: string; raw: string }> = []
  const declRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\[/g
  let match: RegExpExecArray | null

  while ((match = declRegex.exec(source))) {
    const name = match[1]
    const start = match.index + match[0].length - 1 // posição do '['
    const raw = extractBalancedBrackets(source, start)
    if (raw) results.push({ name, raw })
  }
  return results
}

function extractBalancedBrackets(source: string, openIndex: number): string | null {
  let depth = 0
  let inString: '"' | "'" | '`' | null = null
  let inLineComment = false
  let inBlockComment = false

  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i]
    const prev = source[i - 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      continue
    }
    if (inBlockComment) {
      if (prev === '*' && ch === '/') inBlockComment = false
      continue
    }
    if (inString) {
      if (ch === inString && prev !== '\\') inString = null
      continue
    }
    if (ch === '/' && source[i + 1] === '/') {
      inLineComment = true
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      inBlockComment = true
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      continue
    }
    if (ch === '[') depth++
    if (ch === ']') {
      depth--
      if (depth === 0) return source.slice(openIndex, i + 1)
    }
  }
  return null
}

/** Converte só nós "literais" (string/número/bool/array/objeto) da AST pra
 * valor JS de verdade, sem nunca executar código — chamadas de função,
 * JSX, referências a outras variáveis etc. são ignoradas (viram undefined). */
function evaluateLiteral(node: acorn.AnyNode): unknown {
  switch (node.type) {
    case 'Literal':
      return (node as unknown as { value: unknown }).value
    case 'TemplateLiteral': {
      const n = node as unknown as { expressions: unknown[]; quasis: Array<{ value: { cooked: string | null } }> }
      if (n.expressions.length > 0) return undefined
      return n.quasis.map((q) => q.value.cooked ?? '').join('')
    }
    case 'ArrayExpression': {
      const n = node as unknown as { elements: (acorn.AnyNode | null)[] }
      return n.elements.map((el) => (el ? evaluateLiteral(el) : undefined))
    }
    case 'ObjectExpression': {
      const n = node as unknown as {
        properties: Array<{
          type: string
          key: acorn.AnyNode
          value: acorn.AnyNode
          computed: boolean
        }>
      }
      const obj: Record<string, unknown> = {}
      for (const prop of n.properties) {
        if (prop.type !== 'Property' || prop.computed) continue
        const key =
          prop.key.type === 'Identifier'
            ? (prop.key as unknown as { name: string }).name
            : prop.key.type === 'Literal'
              ? String((prop.key as unknown as { value: unknown }).value)
              : null
        if (key === null) continue
        obj[key] = evaluateLiteral(prop.value)
      }
      return obj
    }
    case 'UnaryExpression': {
      const n = node as unknown as { operator: string; argument: acorn.AnyNode }
      const value = evaluateLiteral(n.argument)
      if (typeof value === 'number' && n.operator === '-') return -value
      return undefined
    }
    default:
      return undefined
  }
}

function parseArrayLiteral(raw: string): unknown[] | null {
  try {
    const ast = acorn.parseExpressionAt(`(${raw})`, 1, { ecmaVersion: 'latest' })
    const value = evaluateLiteral(ast)
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

export function findCandidates(source: string): CodeImportCandidate[] {
  const declarations = findArrayDeclarations(source)
  const candidates: CodeImportCandidate[] = []

  for (const decl of declarations) {
    const parsed = parseArrayLiteral(decl.raw)
    if (!parsed || parsed.length === 0) continue

    const items = parsed.filter(
      (item): item is CodeArrayItem =>
        typeof item === 'object' && item !== null && !Array.isArray(item),
    )
    // Heurística: só considera candidato se a maioria dos itens virou objeto
    // (descarta arrays de strings soltas, números, etc.)
    if (items.length < parsed.length * 0.6) continue

    const keySet = new Set<string>()
    for (const item of items) for (const key of Object.keys(item)) keySet.add(key)

    candidates.push({ name: decl.name, items, keys: [...keySet] })
  }

  return candidates
}

export type FieldMapping = {
  questionKey: string
  subtitleKey: string
  optionsKey: string
  imageKey: string
}

/** Transforma os itens detectados no código em etapas de verdade do fluxo,
 * uma pergunta de seleção única por etapa, encadeadas em sequência — e
 * opcionalmente termina com uma etapa de captura de contato. */
export function buildStepsFromCandidate(
  candidate: CodeImportCandidate,
  mapping: FieldMapping,
  addContactStep: boolean,
): FlowStep[] {
  const steps: FlowStep[] = candidate.items.map((item, index) => {
    const question = readString(item[mapping.questionKey]) || `Pergunta ${index + 1}`
    const subtitle = mapping.subtitleKey ? readString(item[mapping.subtitleKey]) : ''
    const imageUrl = mapping.imageKey ? readString(item[mapping.imageKey]) : ''
    const rawOptions = mapping.optionsKey ? item[mapping.optionsKey] : undefined
    const optionLabels = Array.isArray(rawOptions) ? rawOptions.map(String) : []

    const field = defaultField('single-select')
    field.label = question
    field.options = optionLabels.length
      ? optionLabels.map((label) => ({ id: newId('opt'), label, value: slug(label) || newId('v') }))
      : [defaultFieldOption()]

    const step = newStep(question)
    step.description = subtitle
    step.imageUrl = imageUrl
    step.fields = [field]
    step.validation = { required: true, advanceTrigger: 'auto', nextButtonLabel: 'Próximo' }
    return step
  })

  for (let i = 0; i < steps.length - 1; i++) {
    steps[i].defaultNextStepId = steps[i + 1].id
  }

  if (addContactStep) {
    const contact = newStep('Seus dados')
    contact.description = 'Deixe seu contato que a gente fala com você.'
    contact.fields = [
      { ...defaultField('text'), label: 'Nome completo', placeholder: 'Seu nome' },
      { ...defaultField('phone'), label: 'WhatsApp', placeholder: '(11) 91234-5678' },
    ]
    contact.validation = { required: true, advanceTrigger: 'button', nextButtonLabel: 'Enviar' }
    if (steps.length) steps[steps.length - 1].defaultNextStepId = contact.id
    steps.push(contact)
  }

  return steps
}

function readString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}
