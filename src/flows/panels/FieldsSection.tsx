import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import { Switch } from '../../components/ui/Switch'
import { cn } from '../../lib/utils'
import { defaultConsentLinks, defaultField, defaultFieldOption, newId, slug } from '../factory'
import type { FieldType, FormField } from '../types'

const TYPE_OPTIONS: Array<{ value: FieldType; label: string }> = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'single-select', label: 'Seleção única' },
  { value: 'multi-select', label: 'Múltipla seleção' },
  { value: 'file', label: 'Upload de arquivo' },
  { value: 'consent', label: 'Aceite (privacidade/termos)' },
]

const hasOptions = (type: FieldType) => type === 'single-select' || type === 'multi-select'
const isNumeric = (type: FieldType) => type === 'number'
const isTextLike = (type: FieldType) => type === 'text' || type === 'textarea'
const hasPlaceholder = (type: FieldType) => type !== 'consent' && type !== 'file'

export function FieldsSection({
  fields,
  onChange,
}: {
  fields: FormField[]
  onChange: (next: FormField[]) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(fields[0]?.id ?? null)

  function updateField(id: string, patch: Partial<FormField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function addField() {
    const field = defaultField()
    onChange([...fields, field])
    setExpanded(field.id)
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Campos do formulário</Label>
        <Button type="button" variant="secondary" size="sm" onClick={addField}>
          <Plus size={14} />
          Campo
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--vb-border)] px-3 py-4 text-center text-xs text-[var(--vb-text-muted)]">
          Nenhum campo nesta etapa. Pode ser uma etapa só informativa, ou clique em "Campo".
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {fields.map((field) => {
          const isOpen = expanded === field.id
          return (
            <div
              key={field.id}
              className="rounded-lg border border-[var(--vb-border)] bg-[var(--vb-surface-1)]"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : field.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--vb-text)]">
                  {field.label || 'Campo sem nome'}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--vb-surface-3)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--vb-text-muted)]">
                  {TYPE_OPTIONS.find((t) => t.value === field.type)?.label ?? field.type}
                </span>
                {field.required ? (
                  <span className="shrink-0 text-[10px] font-bold text-red-500">*</span>
                ) : null}
              </button>

              {isOpen ? (
                <div className="flex flex-col gap-3 border-t border-[var(--vb-border)] p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo de campo</Label>
                      <Select
                        value={field.type}
                        onChange={(e) => {
                          const type = e.target.value as FieldType
                          updateField(field.id, {
                            type,
                            options:
                              type === 'consent'
                                ? field.options.length === 2
                                  ? field.options
                                  : defaultConsentLinks()
                                : hasOptions(type)
                                  ? field.options.length
                                    ? field.options
                                    : [defaultFieldOption()]
                                  : [],
                          })
                        }}
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-end justify-between">
                      <Switch
                        checked={field.required}
                        onChange={(required) => updateField(field.id, { required })}
                        label="Obrigatório"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{field.type === 'consent' ? 'Texto antes dos links' : 'Rótulo (label)'}</Label>
                    <Input
                      value={field.label}
                      placeholder={field.type === 'consent' ? 'Li e aceito a' : undefined}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                    />
                  </div>

                  {hasPlaceholder(field.type) ? (
                    <div>
                      <Label>Texto de exemplo (placeholder)</Label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      />
                    </div>
                  ) : null}

                  <div>
                    <Label>Mensagem de erro</Label>
                    <Input
                      value={field.errorMessage}
                      onChange={(e) => updateField(field.id, { errorMessage: e.target.value })}
                    />
                  </div>

                  {field.type === 'consent' ? (
                    <LinksEditor
                      field={field}
                      onChange={(options) => updateField(field.id, { options })}
                    />
                  ) : hasOptions(field.type) ? (
                    <OptionsEditor
                      field={field}
                      onChange={(options) => updateField(field.id, { options })}
                    />
                  ) : null}

                  {isTextLike(field.type) ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Mín. de caracteres</Label>
                        <Input
                          type="number"
                          min={0}
                          value={field.validation.minLength ?? ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              validation: {
                                ...field.validation,
                                minLength: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Máx. de caracteres</Label>
                        <Input
                          type="number"
                          min={0}
                          value={field.validation.maxLength ?? ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              validation: {
                                ...field.validation,
                                maxLength: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {isNumeric(field.type) ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Valor mínimo</Label>
                        <Input
                          type="number"
                          value={field.validation.min ?? ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              validation: {
                                ...field.validation,
                                min: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Valor máximo</Label>
                        <Input
                          type="number"
                          value={field.validation.max ?? ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              validation: {
                                ...field.validation,
                                max: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="flex w-fit items-center gap-1.5 text-xs font-semibold text-red-500 hover:underline"
                  >
                    <Trash2 size={13} />
                    Excluir campo
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OptionsEditor({
  field,
  onChange,
}: {
  field: FormField
  onChange: (options: FormField['options']) => void
}) {
  return (
    <div>
      <Label>Opções</Label>
      <div className="flex flex-col gap-1.5">
        {field.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-1.5">
            <Input
              value={opt.label}
              placeholder="Texto mostrado"
              onChange={(e) => {
                const next = [...field.options]
                next[i] = { ...opt, label: e.target.value, value: opt.value || slug(e.target.value) }
                onChange(next)
              }}
            />
            <Input
              value={opt.value}
              placeholder="valor"
              className="w-24 shrink-0"
              onChange={(e) => {
                const next = [...field.options]
                next[i] = { ...opt, value: e.target.value }
                onChange(next)
              }}
            />
            <button
              type="button"
              onClick={() => onChange(field.options.filter((_, oi) => oi !== i))}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--vb-text-muted)] hover:text-red-500',
                field.options.length <= 1 && 'pointer-events-none opacity-30',
              )}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...field.options, { id: newId('opt'), label: '', value: '' }])}
        className="mt-1.5 text-xs font-semibold text-[var(--vb-accent)] hover:underline"
      >
        + adicionar opção
      </button>
    </div>
  )
}

function LinksEditor({
  field,
  onChange,
}: {
  field: FormField
  onChange: (options: FormField['options']) => void
}) {
  return (
    <div>
      <Label>Links (política de privacidade, termos de uso...)</Label>
      <div className="flex flex-col gap-1.5">
        {field.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-1.5">
            <Input
              value={opt.label}
              placeholder="Texto do link (ex: Termos de Uso)"
              onChange={(e) => {
                const next = [...field.options]
                next[i] = { ...opt, label: e.target.value }
                onChange(next)
              }}
            />
            <Input
              value={opt.value}
              placeholder="https://..."
              onChange={(e) => {
                const next = [...field.options]
                next[i] = { ...opt, value: e.target.value }
                onChange(next)
              }}
            />
            <button
              type="button"
              onClick={() => onChange(field.options.filter((_, oi) => oi !== i))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--vb-text-muted)] hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...field.options, { id: newId('opt'), label: '', value: '' }])}
        className="mt-1.5 text-xs font-semibold text-[var(--vb-accent)] hover:underline"
      >
        + adicionar link
      </button>
    </div>
  )
}

export { TYPE_OPTIONS as FIELD_TYPE_OPTIONS }
