import type { ComponentConfig } from '@puckeditor/core'
import { colorField } from '../fields/colorField'
import { spacingField, spacingStyle, type Spacing } from '../fields/spacingField'

export type BannerProps = {
  eyebrow: string
  title: string
  subtitle: string
  imageUrl: string
  buttonLabel: string
  buttonUrl: string
  align: 'left' | 'center'
  backgroundColor: string
  textColor: string
  spacing: Spacing
}

export const Banner: ComponentConfig<BannerProps> = {
  label: 'Banner de Destaque',
  fields: {
    eyebrow: { type: 'text', label: 'Selo/Etiqueta (opcional)' },
    title: { type: 'text', label: 'Título grande' },
    subtitle: { type: 'textarea', label: 'Texto de apoio' },
    imageUrl: { type: 'text', label: 'URL da imagem' },
    buttonLabel: { type: 'text', label: 'Texto do botão' },
    buttonUrl: { type: 'text', label: 'Link do botão' },
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
      ],
    },
    backgroundColor: colorField('Cor de fundo'),
    textColor: colorField('Cor do texto'),
    spacing: spacingField,
  },
  defaultProps: {
    eyebrow: 'Oferta especial',
    title: 'Título de destaque do seu banner',
    subtitle: 'Escreva aqui uma frase curta explicando a oferta ou novidade.',
    imageUrl: 'https://placehold.co/640x420?text=Imagem',
    buttonLabel: 'Ver mais',
    buttonUrl: '#',
    align: 'left',
    backgroundColor: '#eef2ff',
    textColor: '#111827',
    spacing: { top: 56, bottom: 56, x: 24 },
  },
  render: ({
    eyebrow,
    title,
    subtitle,
    imageUrl,
    buttonLabel,
    buttonUrl,
    align,
    backgroundColor,
    textColor,
    spacing,
  }) => (
    <section style={{ backgroundColor, color: textColor, ...spacingStyle(spacing) }}>
      <div
        className={`mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 ${
          align === 'center' ? 'text-center md:text-left' : ''
        }`}
      >
        <div>
          {eyebrow ? (
            <span className="mb-3 inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-md text-base opacity-80">{subtitle}</p>
          <a
            href={buttonUrl}
            className="mt-6 inline-flex rounded-full bg-[#111827] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {buttonLabel}
          </a>
        </div>
        <img
          src={imageUrl}
          alt={title}
          className="h-auto w-full rounded-2xl object-cover shadow-lg"
        />
      </div>
    </section>
  ),
}
