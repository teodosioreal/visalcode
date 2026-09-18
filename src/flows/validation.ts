import type { FieldValue, FlowStep, FormField } from './types'

export function asText(value: FieldValue | undefined): string {
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

export function validateField(field: FormField, value: FieldValue | undefined): string | null {
  const text = asText(value)

  if (field.required) {
    if (field.type === 'multi-select') {
      if (!Array.isArray(value) || value.length === 0) {
        return field.errorMessage || 'Obrigatório.'
      }
    } else if (!text.trim()) {
      return field.errorMessage || 'Obrigatório.'
    }
  }

  if (!text.trim()) return null

  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return field.errorMessage || 'E-mail inválido.'
  }

  if (field.validation.pattern) {
    try {
      if (!new RegExp(field.validation.pattern).test(text)) {
        return field.errorMessage || 'Formato inválido.'
      }
    } catch {
      // regex inválida no config — ignora silenciosamente
    }
  }

  if (field.validation.minLength && text.length < field.validation.minLength) {
    return field.errorMessage || `Mínimo de ${field.validation.minLength} caracteres.`
  }
  if (field.validation.maxLength && text.length > field.validation.maxLength) {
    return field.errorMessage || `Máximo de ${field.validation.maxLength} caracteres.`
  }

  if (field.type === 'number') {
    const num = Number(text)
    if (field.validation.min !== undefined && num < field.validation.min) {
      return field.errorMessage || `O valor mínimo é ${field.validation.min}.`
    }
    if (field.validation.max !== undefined && num > field.validation.max) {
      return field.errorMessage || `O valor máximo é ${field.validation.max}.`
    }
  }

  return null
}

export function validateStep(
  step: FlowStep,
  values: Record<string, FieldValue>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of step.fields) {
    const error = validateField(field, values[field.id])
    if (error) errors[field.id] = error
  }
  return errors
}

export function resolveNextStepId(
  step: FlowStep,
  values: Record<string, FieldValue>,
): string | null {
  for (const branch of step.branches) {
    if (!branch.whenFieldId || !branch.goToStepId) continue
    const text = asText(values[branch.whenFieldId])
    let matches = false
    switch (branch.operator) {
      case 'equals':
        matches = text === branch.value
        break
      case 'not-equals':
        matches = text !== branch.value
        break
      case 'contains':
        matches = text.includes(branch.value)
        break
      case 'greater-than':
        matches = Number(text) > Number(branch.value)
        break
      case 'less-than':
        matches = Number(text) < Number(branch.value)
        break
    }
    if (matches) return branch.goToStepId
  }
  return step.defaultNextStepId
}
