import { useState } from 'react'
import type { Data } from '@puckeditor/core'
import { Dialog } from './ui/Dialog'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Button } from './ui/Button'
import type { GitHubSettings } from '../lib/github'
import { GitHubApiError, fetchFile, verifyConnection } from '../lib/github'
import {
  clearGitHubSettings,
  emptyGitHubSettings,
  saveGitHubSettings,
} from '../lib/githubSettings'
import type { Props } from '../puck/config'

export function GitHubConnectDialog({
  open,
  onClose,
  current,
  onChange,
  onLoad,
}: {
  open: boolean
  onClose: () => void
  current: GitHubSettings | null
  onChange: (settings: GitHubSettings | null) => void
  onLoad: (data: Data<Props>) => void
}) {
  const [form, setForm] = useState<GitHubSettings>(current ?? emptyGitHubSettings())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [status, setStatus] = useState<'idle' | 'checking' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  function set<K extends keyof GitHubSettings>(key: K, value: GitHubSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleConnect() {
    setStatus('checking')
    setError('')
    try {
      await verifyConnection(form)
      saveGitHubSettings(form)
      onChange(form)
      onClose()
    } catch (e) {
      setStatus('error')
      setError(e instanceof GitHubApiError ? e.message : 'Não foi possível conectar.')
      return
    }
    setStatus('idle')
  }

  function handleDisconnect() {
    clearGitHubSettings()
    onChange(null)
    setForm(emptyGitHubSettings())
    onClose()
  }

  async function handleLoad() {
    if (!current) return
    setStatus('loading')
    setError('')
    try {
      const file = await fetchFile(current)
      if (!file) {
        setStatus('error')
        setError('O arquivo ainda não existe nesse repositório/branch.')
        return
      }
      onLoad(JSON.parse(file.content) as Data<Props>)
      onClose()
    } catch (e) {
      setStatus('error')
      setError(
        e instanceof GitHubApiError
          ? e.message
          : 'Não foi possível carregar (arquivo com formato inválido?).',
      )
      return
    }
    setStatus('idle')
  }

  const canSubmit = form.token && form.owner && form.repo && form.branch && form.path

  return (
    <Dialog open={open} onClose={onClose} title="Conectar GitHub">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--vb-text-muted)]">
          Salva o conteúdo editado direto num arquivo do seu repositório, sem precisar
          baixar o .zip. Use um{' '}
          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--vb-accent)] hover:underline"
          >
            token de acesso pessoal (fine-grained)
          </a>{' '}
          com acesso só a este repositório e permissão <b>Contents: Read and write</b>.
        </p>

        <div>
          <Label htmlFor="gh-token">Token de acesso</Label>
          <Input
            id="gh-token"
            type="password"
            autoComplete="off"
            placeholder="github_pat_..."
            value={form.token}
            onChange={(e) => set('token', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="gh-owner">Usuário/organização</Label>
            <Input
              id="gh-owner"
              placeholder="teodosioreal"
              value={form.owner}
              onChange={(e) => set('owner', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gh-repo">Repositório</Label>
            <Input
              id="gh-repo"
              placeholder="visalcode"
              value={form.repo}
              onChange={(e) => set('repo', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="gh-branch">Branch</Label>
          <Input
            id="gh-branch"
            placeholder="main"
            value={form.branch}
            onChange={(e) => set('branch', e.target.value)}
          />
        </div>

        {showAdvanced ? (
          <div>
            <Label htmlFor="gh-path">Caminho do arquivo de conteúdo</Label>
            <Input
              id="gh-path"
              value={form.path}
              onChange={(e) => set('path', e.target.value)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="w-fit text-xs font-semibold text-[var(--vb-text-muted)] hover:text-[var(--vb-text)]"
          >
            Opções avançadas (caminho do arquivo)
          </button>
        )}

        {error ? (
          <p className="rounded-md bg-red-500/10 px-2.5 py-2 text-xs text-red-500">{error}</p>
        ) : null}

        <p className="text-[11px] text-[var(--vb-text-muted)]">
          O token fica guardado só neste navegador (localStorage) — não é enviado a
          nenhum outro lugar além do GitHub. Não use em computador compartilhado.
        </p>

        <div className="mt-1 flex items-center justify-between gap-2">
          {current ? (
            <div className="flex gap-2">
              <Button type="button" variant="danger" size="sm" onClick={handleDisconnect}>
                Desconectar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={status === 'loading'}
                onClick={handleLoad}
              >
                {status === 'loading' ? 'Carregando…' : 'Carregar do GitHub'}
              </Button>
            </div>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!canSubmit || status === 'checking'}
              onClick={handleConnect}
            >
              {status === 'checking' ? 'Verificando…' : 'Conectar'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
