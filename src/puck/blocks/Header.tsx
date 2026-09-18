import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'

export type HeaderProps = {
  logoText: string
  links: Array<{ label: string; url: string }>
  ctaLabel: string
  ctaUrl: string
  showCta: boolean
  backgroundColor: string
  textColor: string
}

export const Header: ComponentConfig<HeaderProps> = {
  label: 'Cabeçalho (Header)',
  fields: {
    logoText: { type: 'text', label: 'Nome / Logo (texto)' },
    links: {
      type: 'array',
      label: 'Links do menu',
      getItemSummary: (item) => item.label || 'Link',
      arrayFields: {
        label: { type: 'text', label: 'Texto' },
        url: { type: 'text', label: 'Link (URL)' },
      },
      defaultItemProps: { label: 'Novo link', url: '#' },
    },
    showCta: { type: 'radio', label: 'Mostrar botão de destaque?', options: [
      { label: 'Sim', value: true },
      { label: 'Não', value: false },
    ] },
    ctaLabel: { type: 'text', label: 'Texto do botão' },
    ctaUrl: { type: 'text', label: 'Link do botão' },
    backgroundColor: colorField('Cor de fundo'),
    textColor: colorField('Cor do texto'),
  },
  defaultProps: {
    logoText: 'Sua Marca',
    links: [
      { label: 'Início', url: '#inicio' },
      { label: 'Ofertas', url: '#ofertas' },
      { label: 'Contato', url: '#contato' },
    ],
    showCta: true,
    ctaLabel: 'Fale conosco',
    ctaUrl: '#contato',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
  },
  render: ({ logoText, links, ctaLabel, ctaUrl, showCta, backgroundColor, textColor }) => (
    <header
      style={{ backgroundColor, color: textColor }}
      className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
    >
      <span className="text-lg font-extrabold tracking-tight">{logoText}</span>
      <nav className="flex flex-wrap items-center gap-5">
        {links?.map((link, i) => (
          <a
            key={i}
            href={link.url}
            className="text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
          >
            {link.label}
          </a>
        ))}
        {showCta ? (
          <a
            href={ctaUrl}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            {ctaLabel}
          </a>
        ) : null}
      </nav>
    </header>
  ),
}
