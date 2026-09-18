import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'

export type ButtonBlockProps = {
  label: string
  url: string
  align: 'left' | 'center' | 'right'
  backgroundColor: string
  textColor: string
}

export const ButtonBlock: ComponentConfig<ButtonBlockProps> = {
  label: 'Botão',
  fields: {
    label: { type: 'text', label: 'Texto do botão' },
    url: { type: 'text', label: 'Link' },
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Direita', value: 'right' },
      ],
    },
    backgroundColor: colorField('Cor do botão'),
    textColor: colorField('Cor do texto'),
  },
  defaultProps: {
    label: 'Clique aqui',
    url: '#',
    align: 'left',
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
  },
  render: ({ label, url, align, backgroundColor, textColor }) => (
    <div
      className="px-6 py-3"
      style={{ textAlign: align }}
    >
      <a
        href={url}
        style={{ backgroundColor, color: textColor }}
        className="inline-flex rounded-full px-6 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
      >
        {label}
      </a>
    </div>
  ),
}
