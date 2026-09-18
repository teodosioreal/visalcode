import type { ComponentConfig } from '@puckeditor/core'

export type ImageBlockProps = {
  url: string
  alt: string
  radius: 'none' | 'md' | 'full'
  maxWidth: number
}

const radiusClass: Record<ImageBlockProps['radius'], string> = {
  none: 'rounded-none',
  md: 'rounded-xl',
  full: 'rounded-full',
}

export const ImageBlock: ComponentConfig<ImageBlockProps> = {
  label: 'Imagem',
  fields: {
    url: { type: 'text', label: 'URL da imagem' },
    alt: { type: 'text', label: 'Texto alternativo' },
    radius: {
      type: 'select',
      label: 'Cantos',
      options: [
        { label: 'Retos', value: 'none' },
        { label: 'Arredondados', value: 'md' },
        { label: 'Circular', value: 'full' },
      ],
    },
    maxWidth: { type: 'number', label: 'Largura máxima (px)', min: 40, max: 1200 },
  },
  defaultProps: {
    url: 'https://placehold.co/600x360?text=Substitua+esta+imagem',
    alt: 'Imagem',
    radius: 'md',
    maxWidth: 600,
  },
  render: ({ url, alt, radius, maxWidth }) => (
    <div className="flex justify-center px-6 py-4">
      <img
        src={url}
        alt={alt}
        style={{ maxWidth }}
        className={`h-auto w-full object-cover ${radiusClass[radius]}`}
      />
    </div>
  ),
}
