import type { ComponentConfig, Slot } from '@puckeditor/core'
import { colorField } from '../fields/colorField'
import { spacingField, spacingStyle, type Spacing } from '../fields/spacingField'

export type ContainerProps = {
  content: Slot
  backgroundColor: string
  spacing: Spacing
}

export const Container: ComponentConfig<ContainerProps> = {
  label: 'Seção em branco (arraste blocos aqui dentro)',
  fields: {
    backgroundColor: colorField('Cor de fundo'),
    spacing: spacingField,
    content: { type: 'slot' },
  },
  defaultProps: {
    backgroundColor: '#ffffff',
    spacing: { top: 40, bottom: 40, x: 24 },
    content: [],
  },
  render: ({ content: Content, backgroundColor, spacing }) => (
    <div style={{ backgroundColor, ...spacingStyle(spacing) }}>
      <Content className="mx-auto flex min-h-[80px] max-w-5xl flex-col gap-4" />
    </div>
  ),
}
