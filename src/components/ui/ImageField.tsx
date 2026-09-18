import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Input } from './Input'
import { dataUrlSizeLabel, fileToOptimizedDataUrl } from '../../lib/imageFile'
import { cn } from '../../lib/utils'

export function ImageField({
  id,
  value,
  onChange,
  placeholder = 'https://... (ou envie um arquivo)',
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const dataUrl = await fileToOptimizedDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError('Não foi possível enviar essa imagem. Tente outro arquivo.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const isUploaded = value.startsWith('data:')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={isUploaded ? '' : value}
          disabled={isUploaded}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          title="Enviar imagem do computador"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-3 text-xs font-semibold text-[var(--vb-text)] transition-colors hover:border-[var(--vb-accent)] disabled:opacity-60"
        >
          <Upload size={13} />
          {busy ? 'Enviando…' : 'Enviar'}
        </button>
        <input
          ref={fileInputRef}
          id={id ? `${id}-file` : undefined}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error ? <p className="text-[11px] text-red-500">{error}</p> : null}

      {value ? (
        <div className="relative w-fit">
          <img
            src={value}
            alt=""
            className="h-20 w-32 rounded-lg border border-[var(--vb-border)] object-cover"
          />
          <button
            type="button"
            title="Remover imagem"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow"
          >
            <X size={11} />
          </button>
          {isUploaded ? (
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              {dataUrlSizeLabel(value)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
