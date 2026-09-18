import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Puck } from '@puckeditor/core'
import { config, type PuckData } from '../puck/config'
import { initialData } from '../data/initial-data'
import { exportProjectZip } from '../lib/exportZip'
import { TopBar } from '../components/TopBar'
import { GitHubConnectDialog } from '../components/GitHubConnectDialog'
import type { GitHubPushStatus } from '../components/GitHubButton'
import { GitHubApiError, saveFile, type GitHubSettings } from '../lib/github'
import { loadGitHubSettings } from '../lib/githubSettings'
import { formatFullDateTime } from '../lib/utils'

export const Route = createFileRoute('/')({ component: Editor })

const STORAGE_KEY = 'vb:puck-data'

function loadStoredData(): PuckData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PuckData) : null
  } catch {
    return null
  }
}

function parseUpdatedAt(data: PuckData): Date | null {
  const iso = data.root?.props?.updatedAt
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Grava a hora da edição dentro do próprio conteúdo (root.props.updatedAt),
 * em vez de num lugar separado — assim ela vai junto pro .zip, pro GitHub e
 * aparece igual em qualquer navegador/dispositivo que abrir esse conteúdo. */
function stampUpdatedAt(data: PuckData): PuckData {
  return {
    ...data,
    root: { ...data.root, props: { ...data.root.props, updatedAt: new Date().toISOString() } },
  }
}

function Editor() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<PuckData>(initialData)
  const [saved, setSaved] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const dataRef = useRef(data)
  // O <Puck> só lê `data` na primeira renderização (estado interno próprio).
  // Trocar a `key` força ele a remontar do zero com o novo conteúdo — é o
  // que faz "Carregar do GitHub" realmente atualizar a tela.
  const [puckKey, setPuckKey] = useState(0)

  const [githubSettings, setGithubSettings] = useState<GitHubSettings | null>(null)
  const [githubDialogOpen, setGithubDialogOpen] = useState(false)
  const [githubStatus, setGithubStatus] = useState<GitHubPushStatus>('idle')
  const [githubError, setGithubError] = useState<string>()

  useEffect(() => {
    const stored = loadStoredData()
    if (stored) {
      setData(stored)
      dataRef.current = stored
      setLastSavedAt(parseUpdatedAt(stored))
    } else {
      setLastSavedAt(parseUpdatedAt(initialData))
    }
    setGithubSettings(loadGitHubSettings())
    setMounted(true)
  }, [])

  const handleChange = useCallback((next: PuckData) => {
    const stamped = stampUpdatedAt(next)
    dataRef.current = stamped
    setSaved(false)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped))
    setLastSavedAt(parseUpdatedAt(stamped))
    setSaved(true)
  }, [])

  const handleDownload = useCallback(async () => {
    await exportProjectZip(dataRef.current)
  }, [])

  const handlePushToGitHub = useCallback(async () => {
    if (!githubSettings) return
    setGithubStatus('saving')
    setGithubError(undefined)
    try {
      await saveFile(
        githubSettings,
        JSON.stringify(dataRef.current, null, 2),
        `Atualiza conteúdo via editor visual (${formatFullDateTime(new Date())})`,
      )
      setGithubStatus('success')
    } catch (e) {
      setGithubStatus('error')
      setGithubError(e instanceof GitHubApiError ? e.message : 'Erro ao salvar')
      return
    }
    setTimeout(() => setGithubStatus('idle'), 4000)
  }, [githubSettings])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--vb-bg)] text-sm text-[var(--vb-text-muted)]">
        Carregando editor visual…
      </div>
    )
  }

  return (
    <>
      <Puck
        key={puckKey}
        config={config}
        data={data}
        onChange={handleChange}
        iframe={{ enabled: false }}
        overrides={{
          header: () => (
            <TopBar
              onDownload={handleDownload}
              saved={saved}
              lastSavedAt={lastSavedAt}
              githubSettings={githubSettings}
              githubStatus={githubStatus}
              githubError={githubError}
              onOpenGitHubDialog={() => setGithubDialogOpen(true)}
              onPushToGitHub={handlePushToGitHub}
            />
          ),
        }}
      />
      <GitHubConnectDialog
        open={githubDialogOpen}
        onClose={() => setGithubDialogOpen(false)}
        current={githubSettings}
        onChange={setGithubSettings}
        onLoad={(loaded) => {
          dataRef.current = loaded
          setData(loaded)
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded))
          setLastSavedAt(parseUpdatedAt(loaded))
          setPuckKey((k) => k + 1)
        }}
      />
    </>
  )
}
