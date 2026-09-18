import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'
import { spacingField, spacingStyle, type Spacing } from '../fields/spacingField'

type Testimonial = {
  quote: string
  name: string
  role: string
  avatarUrl: string
}

export type TestimonialsProps = {
  title: string
  items: Array<Testimonial>
  backgroundColor: string
  spacing: Spacing
}

export const Testimonials: ComponentConfig<TestimonialsProps> = {
  label: 'Depoimentos',
  fields: {
    title: { type: 'text', label: 'Título da seção' },
    backgroundColor: colorField('Cor de fundo'),
    items: {
      type: 'array',
      label: 'Depoimentos',
      getItemSummary: (item) => item.name || 'Depoimento',
      defaultItemProps: {
        quote: 'Escreva aqui o depoimento do cliente.',
        name: 'Nome do cliente',
        role: 'Cargo / empresa',
        avatarUrl: 'https://placehold.co/80x80?text=Foto',
      },
      arrayFields: {
        quote: { type: 'textarea', label: 'Depoimento' },
        name: { type: 'text', label: 'Nome' },
        role: { type: 'text', label: 'Cargo / empresa' },
        avatarUrl: { type: 'text', label: 'URL da foto' },
      },
    },
    spacing: spacingField,
  },
  defaultProps: {
    title: 'O que dizem sobre a gente',
    backgroundColor: '#f8fafc',
    items: [
      {
        quote: 'Um serviço excelente, recomendo demais!',
        name: 'Maria Souza',
        role: 'Cliente',
        avatarUrl: 'https://placehold.co/80x80?text=M',
      },
      {
        quote: 'Superou minhas expectativas em todos os aspectos.',
        name: 'João Lima',
        role: 'Cliente',
        avatarUrl: 'https://placehold.co/80x80?text=J',
      },
    ],
    spacing: { top: 56, bottom: 56, x: 24 },
  },
  render: ({ title, items, backgroundColor, spacing }) => (
    <section style={{ backgroundColor, ...spacingStyle(spacing) }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items?.map((item, i) => (
            <figure key={i} className="rounded-2xl bg-white p-6 shadow-sm">
              <blockquote className="text-gray-700">“{item.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  ),
}
