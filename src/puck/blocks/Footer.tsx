import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'

export type FooterProps = {
  brandText: string
  copyrightText: string
  links: Array<{ label: string; url: string }>
  backgroundColor: string
  textColor: string
}

export const Footer: ComponentConfig<FooterProps> = {
  label: 'Rodapé (Footer)',
  fields: {
    brandText: { type: 'text', label: 'Nome da marca' },
    copyrightText: { type: 'text', label: 'Texto de direitos autorais' },
    links: {
      type: 'array',
      label: 'Links',
      getItemSummary: (item) => item.label || 'Link',
      defaultItemProps: { label: 'Novo link', url: '#' },
      arrayFields: {
        label: { type: 'text', label: 'Texto' },
        url: { type: 'text', label: 'Link (URL)' },
      },
    },
    backgroundColor: colorField('Cor de fundo'),
    textColor: colorField('Cor do texto'),
  },
  defaultProps: {
    brandText: 'Sua Marca',
    copyrightText: `© ${new Date().getFullYear()} Sua Marca. Todos os direitos reservados.`,
    links: [
      { label: 'Instagram', url: '#' },
      { label: 'WhatsApp', url: '#' },
      { label: 'Contato', url: '#' },
    ],
    backgroundColor: '#0f172a',
    textColor: '#e2e8f0',
  },
  render: ({ brandText, copyrightText, links, backgroundColor, textColor }) => (
    <footer style={{ backgroundColor, color: textColor }} className="px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <span className="text-lg font-extrabold">{brandText}</span>
        <nav className="flex flex-wrap justify-center gap-4">
          {links?.map((link, i) => (
            <a key={i} href={link.url} className="text-sm opacity-80 hover:opacity-100">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs opacity-60">{copyrightText}</p>
      </div>
    </footer>
  ),
}
