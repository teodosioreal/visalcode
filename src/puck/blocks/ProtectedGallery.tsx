import { useState } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import { spacingField, spacingStyle, type Spacing } from '../fields/spacingField'

type GalleryImage = { url: string; caption: string }

export type ProtectedGalleryProps = {
  title: string
  description: string
  password: string
  images: Array<GalleryImage>
  spacing: Spacing
}

function GalleryView({ title, description, images }: ProtectedGalleryProps) {
  return (
    <>
      <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images?.map((img, i) => (
          <figure key={i} className="overflow-hidden rounded-xl border border-gray-200">
            <img src={img.url} alt={img.caption} className="h-32 w-full object-cover" />
            {img.caption ? (
              <figcaption className="p-2 text-center text-xs text-gray-500">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </>
  )
}

function ProtectedGalleryRender(props: ProtectedGalleryProps) {
  const { password, spacing } = props
  const [unlocked, setUnlocked] = useState(!password)
  const [attempt, setAttempt] = useState('')
  const [error, setError] = useState(false)

  return (
    <section style={spacingStyle(spacing)} className="bg-white">
      <div className="mx-auto max-w-5xl">
        {unlocked ? (
          <GalleryView {...props} />
        ) : (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <span className="text-3xl">🔒</span>
            <h3 className="text-lg font-bold text-gray-900">{props.title}</h3>
            <p className="text-sm text-gray-500">Conteúdo protegido por senha.</p>
            <input
              type="password"
              value={attempt}
              onChange={(e) => {
                setAttempt(e.target.value)
                setError(false)
              }}
              placeholder="Digite a senha"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            {error ? <p className="text-xs text-red-600">Senha incorreta, tente novamente.</p> : null}
            <button
              type="button"
              onClick={() => (attempt === password ? setUnlocked(true) : setError(true))}
              className="w-full rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-700"
            >
              Ver galeria
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export const ProtectedGallery: ComponentConfig<ProtectedGalleryProps> = {
  label: 'Galeria Protegida',
  fields: {
    title: { type: 'text', label: 'Título' },
    description: { type: 'text', label: 'Descrição' },
    password: { type: 'text', label: 'Senha de acesso (deixe em branco para não proteger)' },
    images: {
      type: 'array',
      label: 'Imagens',
      getItemSummary: (item) => item.caption || 'Imagem',
      defaultItemProps: { url: 'https://placehold.co/300x200', caption: '' },
      arrayFields: {
        url: { type: 'text', label: 'URL da imagem' },
        caption: { type: 'text', label: 'Legenda (opcional)' },
      },
    },
    spacing: spacingField,
  },
  defaultProps: {
    title: 'Galeria Protegida',
    description: 'Somente para quem tem a senha de acesso.',
    password: '',
    images: [
      { url: 'https://placehold.co/300x200?text=1', caption: '' },
      { url: 'https://placehold.co/300x200?text=2', caption: '' },
      { url: 'https://placehold.co/300x200?text=3', caption: '' },
      { url: 'https://placehold.co/300x200?text=4', caption: '' },
    ],
    spacing: { top: 56, bottom: 56, x: 24 },
  },
  render: (props) => <ProtectedGalleryRender {...props} />,
}
