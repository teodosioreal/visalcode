export type GitHubSettings = {
  token: string
  owner: string
  repo: string
  branch: string
  path: string
}

export class GitHubApiError extends Error {}

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToUtf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function apiUrl({ owner, repo, path }: GitHubSettings) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string }
    if (body?.message) return body.message
  } catch {
    // resposta sem corpo JSON — usa o status
  }
  if (res.status === 401) return 'Token inválido ou expirado.'
  if (res.status === 403)
    return 'Sem permissão. Confira se o token tem acesso de escrita (Contents) a este repositório.'
  if (res.status === 404) return 'Repositório, branch ou arquivo não encontrado.'
  return `Erro do GitHub (HTTP ${res.status}).`
}

/** Busca o conteúdo atual de um arquivo no repositório. Retorna null se ele ainda não existir. */
export async function fetchFile(
  settings: GitHubSettings,
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${apiUrl(settings)}?ref=${encodeURIComponent(settings.branch)}`,
    { headers: authHeaders(settings.token) },
  )
  if (res.status === 404) return null
  if (!res.ok) throw new GitHubApiError(await readErrorMessage(res))
  const json = (await res.json()) as { content: string; sha: string }
  return { content: base64ToUtf8(json.content), sha: json.sha }
}

/** Cria ou atualiza um arquivo no repositório (commit direto na branch configurada). */
export async function saveFile(
  settings: GitHubSettings,
  content: string,
  message: string,
): Promise<void> {
  const existing = await fetchFile(settings)
  const res = await fetch(apiUrl(settings), {
    method: 'PUT',
    headers: { ...authHeaders(settings.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: settings.branch,
      ...(existing ? { sha: existing.sha } : {}),
    }),
  })
  if (!res.ok) throw new GitHubApiError(await readErrorMessage(res))
}

/** Testa se o token consegue acessar o repositório/branch configurados. */
export async function verifyConnection(settings: GitHubSettings): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${settings.owner}/${settings.repo}/branches/${encodeURIComponent(settings.branch)}`,
    { headers: authHeaders(settings.token) },
  )
  if (!res.ok) throw new GitHubApiError(await readErrorMessage(res))
}
