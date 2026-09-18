import type { ObjectField } from '@puckeditor/core'

export type Spacing = { top: number; bottom: number; x: number }

export const defaultSpacing: Spacing = { top: 48, bottom: 48, x: 24 }

/** Editor de espaçamento (padding) em pixels, com 3 campos simples para leigos: cima, baixo, laterais. */
export const spacingField: ObjectField<Spacing> = {
  type: 'object',
  label: 'Espaçamento interno (px)',
  objectFields: {
    top: { type: 'number', label: 'Em cima', min: 0, max: 200 },
    bottom: { type: 'number', label: 'Embaixo', min: 0, max: 200 },
    x: { type: 'number', label: 'Laterais', min: 0, max: 200 },
  },
}

export function spacingStyle(spacing: Spacing | undefined) {
  const s = spacing ?? defaultSpacing
  return {
    paddingTop: s.top,
    paddingBottom: s.bottom,
    paddingLeft: s.x,
    paddingRight: s.x,
  }
}
