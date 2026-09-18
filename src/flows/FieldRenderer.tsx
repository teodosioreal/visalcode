import { Input, Textarea } from '../components/ui/Input'
import { cn } from '../lib/utils'
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
      return (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      )
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
