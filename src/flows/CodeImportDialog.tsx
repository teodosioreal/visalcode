import { useEffect, useState } from 'react'
import { Dialog } from '../components/ui/Dialog'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Switch } from '../components/ui/Switch'
import {
  buildStepsFromCandidate,
  guessMapping,
  type CodeImportCandidate,
  type FieldMapping,
} from './codeImport'
import type { FlowStep } from './types'

export function CodeImportDialog({
  open,
  onClose,
  candidates,
  onGenerate,
}: {
  open: boolean
  onClose: () => void
  candidates: CodeImportCandidate[]
  onGenerate: (steps: FlowStep[], mode: 'replace' | 'append') => void
}) {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [mapping, setMapping] = useState<FieldMapping>({
    questionKey: '',
    subtitleKey: '',
    optionsKey: '',
    imageKey: '',
  })
  const [addContactStep, setAddContactStep] = useState(true)
  const [mode, setMode] = useState<'replace' | 'append'>('replace')

  const candidate = candidates[candidateIndex]

  useEffect(() => {
    if (open && candidate) setMapping(guessMapping(candidate.keys))
  }, [open, candidateIndex, candidate])

  if (!candidate) {
    return (
      <Dialog open={open} onClose={onClose} title="Importar de código">
        <p className="text-sm text-[var(--vb-text-muted)]">
          Não encontrei nenhuma lista de perguntas reconhecível nesse arquivo (ou em nenhum
          arquivo do .zip) — precisa ter um array de objetos tipo{' '}
          <code className="rounded bg-[var(--vb-surface-2)] px-1 py-0.5">
            {'{ question: "...", options: [...] }'}
          </code>
          . Você pode colar o conteúdo em "Ver JSON" manualmente, ou me mandar o arquivo no chat
          que eu converto.
        </p>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Dialog>
    )
  }

  const preview = buildStepsFromCandidate(candidate, mapping, addContactStep)
  const canGenerate = mapping.questionKey !== ''

  return (
    <Dialog open={open} onClose={onClose} title="Importar de código" className="max-w-xl">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--vb-text-muted)]">
          Encontrei {candidates.length > 1 ? 'estas listas' : 'esta lista'} de itens no arquivo.
          Diz qual chave é qual e eu gero uma etapa pra cada item.
        </p>

        {candidates.length > 1 ? (
          <div>
            <Label>Lista encontrada</Label>
            <Select
              value={candidateIndex}
              onChange={(e) => setCandidateIndex(Number(e.target.value))}
            >
              {candidates.map((c, i) => (
                <option key={c.name + i} value={i}>
                  {c.filePath ? `${c.filePath} — ` : ''}
                  {c.name} ({c.items.length} itens)
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <p className="text-xs text-[var(--vb-text-muted)]">
            {candidate.filePath ? (
              <>
                Arquivo <b>{candidate.filePath}</b>, variável <b>{candidate.name}</b> —{' '}
              </>
            ) : (
              <>
                Variável <b>{candidate.name}</b> —{' '}
              </>
            )}
            {candidate.items.length} itens.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <KeySelect
            label="Qual chave é a pergunta?"
            keys={candidate.keys}
            value={mapping.questionKey}
            onChange={(questionKey) => setMapping({ ...mapping, questionKey })}
            required
          />
          <KeySelect
            label="Qual chave são as opções?"
            keys={candidate.keys}
            value={mapping.optionsKey}
            onChange={(optionsKey) => setMapping({ ...mapping, optionsKey })}
          />
          <KeySelect
            label="Qual chave é o subtítulo? (opcional)"
            keys={candidate.keys}
            value={mapping.subtitleKey}
            onChange={(subtitleKey) => setMapping({ ...mapping, subtitleKey })}
          />
          <KeySelect
            label="Qual chave é a imagem? (opcional)"
            keys={candidate.keys}
            value={mapping.imageKey}
            onChange={(imageKey) => setMapping({ ...mapping, imageKey })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--vb-border)] px-3 py-2">
          <Label className="mb-0">Adicionar etapa final de contato (nome + WhatsApp)</Label>
          <Switch checked={addContactStep} onChange={setAddContactStep} />
        </div>

        <div>
          <Label>Isso vai...</Label>
          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--vb-border)] px-3 py-2 text-sm text-[var(--vb-text)] has-[:checked]:border-[var(--vb-accent)] has-[:checked]:bg-[var(--vb-accent)]/10">
              <input
                type="radio"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="accent-[var(--vb-accent)]"
              />
              Substituir todas as etapas do fluxo atual
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--vb-border)] px-3 py-2 text-sm text-[var(--vb-text)] has-[:checked]:border-[var(--vb-accent)] has-[:checked]:bg-[var(--vb-accent)]/10">
              <input
                type="radio"
                checked={mode === 'append'}
                onChange={() => setMode('append')}
                className="accent-[var(--vb-accent)]"
              />
              Adicionar no fim do fluxo atual
            </label>
          </div>
        </div>

        <div>
          <Label>Prévia das etapas geradas</Label>
          <ol className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-[var(--vb-border)] p-2 text-xs text-[var(--vb-text-muted)]">
            {preview.map((step, i) => (
              <li key={step.id}>
                {i + 1}. {step.title}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canGenerate}
            onClick={() => {
              onGenerate(preview, mode)
              onClose()
            }}
          >
            Gerar etapas
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function KeySelect({
  label,
  keys,
  value,
  onChange,
  required,
}: {
  label: string
  keys: string[]
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{required ? 'escolha…' : '(nenhum)'}</option>
        {keys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Select>
    </div>
  )
}
