import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Puck, type Data } from '@puckeditor/core'
import { config, type Props } from '../puck/config'
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
const LAST_SAVED_KEY = 'vb:last-saved-at'

function loadStoredData(): Data<Props> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Data<Props>) : null
  } catch {
    return null
  }
}

function loadLastSavedAt(): Date | null {
  const raw = window.localStorage.getItem(LAST_SAVED_KEY)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function Editor() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<Data<Props>>(initialData)
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
    }
    setLastSavedAt(loadLastSavedAt())
    setGithubSettings(loadGitHubSettings())
    setMounted(true)
  }, [])

  const handleChange = useCallback((next: Data<Props>) => {
    dataRef.current = next
    setSaved(false)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    const now = new Date()
    window.localStorage.setItem(LAST_SAVED_KEY, now.toISOString())
    setLastSavedAt(now)
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
          const now = new Date()
          window.localStorage.setItem(LAST_SAVED_KEY, now.toISOString())
          setLastSavedAt(now)
          setPuckKey((k) => k + 1)
        }}
      />
    </>
  )
}
