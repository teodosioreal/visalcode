import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'
import { spacingField, spacingStyle, type Spacing } from '../fields/spacingField'

type Plan = {
  name: string
  price: string
  period: string
  features: string
  ctaLabel: string
  ctaUrl: string
  highlighted: boolean
}

export type PricingTableProps = {
  title: string
  subtitle: string
  plans: Array<Plan>
  accentColor: string
  spacing: Spacing
}

export const PricingTable: ComponentConfig<PricingTableProps> = {
  label: 'Tabela de Preços',
  fields: {
    title: { type: 'text', label: 'Título da seção' },
    subtitle: { type: 'text', label: 'Subtítulo' },
    accentColor: colorField('Cor de destaque'),
    plans: {
      type: 'array',
      label: 'Planos',
      getItemSummary: (item) => item.name || 'Plano',
      defaultItemProps: {
        name: 'Novo plano',
        price: 'R$ 0',
        period: '/mês',
        features: 'Recurso 1\nRecurso 2\nRecurso 3',
        ctaLabel: 'Assinar',
        ctaUrl: '#',
        highlighted: false,
      },
      arrayFields: {
        name: { type: 'text', label: 'Nome do plano' },
        price: { type: 'text', label: 'Preço' },
        period: { type: 'text', label: 'Período (ex: /mês)' },
        features: { type: 'textarea', label: 'Recursos (um por linha)' },
        ctaLabel: { type: 'text', label: 'Texto do botão' },
        ctaUrl: { type: 'text', label: 'Link do botão' },
        highlighted: {
          type: 'radio',
          label: 'Destacar este plano?',
          options: [
            { label: 'Sim', value: true },
            { label: 'Não', value: false },
          ],
        },
      },
    },
    spacing: spacingField,
  },
  defaultProps: {
    title: 'Planos e preços',
    subtitle: 'Escolha a opção ideal para você',
    accentColor: '#2563eb',
    plans: [
      {
        name: 'Básico',
        price: 'R$ 29',
        period: '/mês',
        features: 'Recurso 1\nRecurso 2\nRecurso 3',
        ctaLabel: 'Assinar',
        ctaUrl: '#',
        highlighted: false,
      },
      {
        name: 'Profissional',
        price: 'R$ 59',
        period: '/mês',
        features: 'Tudo do Básico\nRecurso extra\nSuporte prioritário',
        ctaLabel: 'Assinar',
        ctaUrl: '#',
        highlighted: true,
      },
      {
        name: 'Premium',
        price: 'R$ 99',
        period: '/mês',
        features: 'Tudo do Profissional\nRecursos ilimitados\nSuporte VIP',
        ctaLabel: 'Assinar',
        ctaUrl: '#',
        highlighted: false,
      },
    ],
    spacing: { top: 56, bottom: 56, x: 24 },
  },
  render: ({ title, subtitle, plans, accentColor, spacing }) => (
    <section style={spacingStyle(spacing)} className="bg-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-500">{subtitle}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans?.map((plan, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border p-6 text-left shadow-sm"
              style={
                plan.highlighted
                  ? { borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}33` }
                  : { borderColor: '#e5e7eb' }
              }
            >
              {plan.highlighted ? (
                <span
                  className="mb-3 inline-block w-fit rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Mais popular
                </span>
              ) : null}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                {plan.features?.split('\n').filter(Boolean).map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2">
                    <span style={{ color: accentColor }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.ctaUrl}
                className="mt-6 rounded-full px-4 py-2.5 text-center text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: accentColor }}
              >
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
}
