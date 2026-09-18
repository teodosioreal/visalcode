import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Puck, type Data } from '@puckeditor/core'
import { config, type Props } from '../puck/config'
import { initialData } from '../data/initial-data'
import { exportProjectZip } from '../lib/exportZip'
import { TopBar } from '../components/TopBar'

export const Route = createFileRoute('/')({ component: Editor })

const STORAGE_KEY = 'vb:puck-data'

function loadStoredData(): Data<Props> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Data<Props>) : null
  } catch {
    return null
  }
}

function Editor() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<Data<Props>>(initialData)
  const [saved, setSaved] = useState(true)
  const dataRef = useRef(data)

  useEffect(() => {
    const stored = loadStoredData()
    if (stored) {
      setData(stored)
      dataRef.current = stored
    }
    setMounted(true)
  }, [])

  const handleChange = useCallback((next: Data<Props>) => {
    dataRef.current = next
    setSaved(false)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSaved(true)
  }, [])

  const handleDownload = useCallback(async () => {
    await exportProjectZip(dataRef.current)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--vb-bg)] text-sm text-[var(--vb-text-muted)]">
        Carregando editor visual…
      </div>
    )
  }

  return (
    <Puck
      config={config}
      data={data}
      onChange={handleChange}
      iframe={{ enabled: false }}
      overrides={{
        header: () => <TopBar onDownload={handleDownload} saved={saved} />,
      }}
    />
  )
}
