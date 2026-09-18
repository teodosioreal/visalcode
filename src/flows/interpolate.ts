import { asText } from './validation'
import type { FieldValue, FormField } from './types'

/**
 * Troca {{idDoCampo}} dentro de um texto pela resposta dada (ou, se for uma
 * seleção, pelo rótulo da opção escolhida). Usado na etapa de "diagnóstico"
 * pra resumir o que a pessoa preencheu nas etapas anteriores.
 *
 * Sem resposta ainda (edição/preview fora do modo de teste), mostra o rótulo
 * do campo entre colchetes, pra dar uma prévia legível do texto final.
 */
export function interpolate(
  text: string,
  values: Record<string, FieldValue>,
  fieldsById: Map<string, FormField>,
): string {
  return text.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (match, fieldId: string) => {
    const field = fieldsById.get(fieldId)
    const value = values[fieldId]

    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return field ? `[${field.label}]` : match
    }

    if (!field) return asText(value)

    if (field.type === 'single-select' || field.type === 'multi-select') {
      const selected = Array.isArray(value) ? value : [value]
      const labels = selected.map((v) => field.options.find((o) => o.value === v)?.label ?? v)
      return labels.join(', ')
    }

    return asText(value)
  })
}

export function buildFieldsById(allFields: FormField[][]): Map<string, FormField> {
  const map = new Map<string, FormField>()
  for (const fields of allFields) {
    for (const field of fields) map.set(field.id, field)
  }
  return map
}
