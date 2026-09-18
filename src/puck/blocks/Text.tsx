import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'

export type TextProps = {
  content: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  align: 'left' | 'center' | 'right'
  color: string
}

const sizeClass: Record<TextProps['size'], string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl font-bold',
}

export const Text: ComponentConfig<TextProps> = {
  label: 'Texto',
  fields: {
    content: { type: 'textarea', label: 'Conteúdo' },
    size: {
      type: 'select',
      label: 'Tamanho',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Médio', value: 'md' },
        { label: 'Grande', value: 'lg' },
        { label: 'Título', value: 'xl' },
      ],
    },
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Direita', value: 'right' },
      ],
    },
    color: colorField('Cor do texto'),
  },
  defaultProps: {
    content: 'Clique aqui para editar este texto.',
    size: 'md',
    align: 'left',
    color: '#111827',
  },
  render: ({ content, size, align, color }) => (
    <p
      style={{ color, textAlign: align }}
      className={`px-6 py-3 whitespace-pre-wrap ${sizeClass[size]}`}
    >
      {content}
    </p>
  ),
}
