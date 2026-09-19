import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Input, Textarea } from '../components/ui/Input'
import { cn } from '../lib/utils'
import { fileToOptimizedDataUrl } from '../lib/imageFile'
import type { FieldValue, FormField } from './types'

export function FieldRenderer({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField
  value: FieldValue | undefined
  error?: string
  onChange: (value: FieldValue) => void
}) {
  if (field.type === 'consent') {
    const checked = value === 'true'
    return (
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked ? 'true' : '')}
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
          />
          <span>
            {field.label}
            {field.label ? ' ' : ''}
            {field.options.map((opt, i) => (
              <span key={opt.id}>
                {i > 0 ? ' e ' : ''}
                {opt.value ? (
                  <a
                    href={opt.value}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-blue-600 underline hover:text-blue-700"
                  >
                    {opt.label || 'link'}
                  </a>
                ) : (
                  <span className="font-semibold">{opt.label || 'link'}</span>
                )}
              </span>
            ))}
            {field.options.length ? '.' : ''}
          </span>
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">
        {field.label}
        {field.required ? <span className="text-red-500"> *</span> : null}
      </label>

      <FieldInput field={field} value={value} onChange={onChange} hasError={!!error} />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
  hasError,
}: {
  field: FormField
  value: FieldValue | undefined
  onChange: (value: FieldValue) => void
  hasError: boolean
}) {
  const errorClass = hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          className={errorClass}
          placeholder={field.placeholder}
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'single-select':
      return (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                value === opt.value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    case 'multi-select': {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChange(
                    isSelected
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value],
                  )
                }
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400',
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )
    }
    case 'file':
      return <FileFieldInput value={value} onChange={onChange} hasError={hasError} />
    default:
      return (
        <Input
          className={errorClass}
          type={
            field.type === 'email'
              ? 'email'
              : field.type === 'number'
                ? 'number'
                : field.type === 'date'
                  ? 'date'
                  : field.type === 'phone'
                    ? 'tel'
                    : 'text'
          }
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

/** Upload de foto (ex: documento, foto do produto...). Converte pra data
 * URL no próprio navegador — vira o valor do campo, e viaja junto nas
 * respostas até o webhook final, sem precisar de servidor pra hospedar. */
function FileFieldInput({
  value,
  onChange,
  hasError,
}: {
  value: FieldValue | undefined
  onChange: (value: FieldValue) => void
  hasError: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dataUrl = typeof value === 'string' ? value : ''

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const optimized = await fileToOptimizedDataUrl(file, { maxDimension: 1200, quality: 0.75 })
      onChange(optimized)
    } catch {
      setError('Não foi possível enviar esse arquivo. Tente outro.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (dataUrl) {
    return (
      <div className="relative w-fit">
        <img
          src={dataUrl}
          alt=""
          className="h-32 w-32 rounded-lg border border-gray-300 object-cover"
        />
        <button
          type="button"
          title="Remover"
          onClick={() => onChange('')}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow"
        >
          <X size={11} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          'flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-sm font-semibold text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-60',
          hasError ? 'border-red-400' : 'border-gray-300',
        )}
      >
        <Upload size={18} />
        {busy ? 'Enviando…' : 'Escolher arquivo'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
