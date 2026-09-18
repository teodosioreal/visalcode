import type { GitHubSettings } from './github'

const STORAGE_KEY = 'vb:github-settings'
const DEFAULT_PATH = 'src/data/initial-data.json'
const DEFAULT_BRANCH = 'main'

export function loadGitHubSettings(): GitHubSettings | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GitHubSettings
  } catch {
    return null
  }
}

export function saveGitHubSettings(settings: GitHubSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearGitHubSettings() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function emptyGitHubSettings(): GitHubSettings {
  return { token: '', owner: '', repo: '', branch: DEFAULT_BRANCH, path: DEFAULT_PATH }
}
