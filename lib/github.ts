import { Octokit } from 'octokit'
import { SignJWT, importPKCS8 } from 'jose'
import { nanoid } from 'nanoid'
import type { CharEntry } from './types'

const OWNER = 'phucbm'
const REPO = 'chiet-tu'

async function getInstallationToken(): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_GITHUB_APP_ID as string
  const installationId = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALLATION_ID as string
  const rawKey = process.env.NEXT_PUBLIC_GITHUB_APP_PRIVATE_KEY as string

  if (!appId || !installationId || !rawKey) throw new Error('NO_GITHUB_APP_CONFIG')

  const pem = rawKey.replace(/\\n/g, '\n')
  const key = await importPKCS8(pem, 'RS256')

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer(appId)
    .setExpirationTime('10m')
    .sign(key)

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!res.ok) throw new Error(`GitHub App token error: ${res.status}`)
  const data = await res.json()
  return data.token
}

async function getOctokit(): Promise<Octokit> {
  const token = await getInstallationToken()
  return new Octokit({ auth: token })
}

export function prTitle(char: string, nickname: string, mode: 'new' | 'edit') {
  return `${mode === 'edit' ? '[edit]' : '[new]'} ${char} by ${nickname}`
}

function prBody(entry: Partial<CharEntry>, nickname: string): string {
  const components = entry.etymology?.components
    ?.map(c => `  - ${c.char} (${c.componentName}): ${c.sino_vietnamese} — ${c.translation}`)
    .join('\n') ?? ''

  return [
    `**Character:** ${entry.char}${entry.trad ? ` / ${entry.trad}` : ''}`,
    `**Pinyin:** ${entry.pinyin ?? ''}`,
    `**Sino-Vietnamese:** ${entry.sino_vietnamese ?? ''}`,
    `**Translation (VI):** ${entry.translation?.vi ?? ''}`,
    '',
    entry.etymology?.note ? `**Etymology note:** ${entry.etymology.note}` : '',
    components ? `**Components:**\n${components}` : '',
    '',
    '---',
    `Contributed by: ${nickname}`,
    `_Added via chiết tự app._`,
  ].filter(l => l !== undefined).join('\n')
}

export async function contributeChar(
  entry: Partial<CharEntry>,
  nickname: string,
  mode: 'new' | 'edit',
  existingSha?: string
): Promise<string> {
  const octokit = await getOctokit()
  const char = entry.char!
  const filePath = `chars/${char}.json`
  const branch = `char/${char}-${nanoid(6)}`

  const { data: ref } = await octokit.rest.git.getRef({ owner: OWNER, repo: REPO, ref: 'heads/main' })
  const mainSha = ref.object.sha

  // Strip runtime-only fields before persisting
  const { source: _source, copiedFrom: _copiedFrom, createdAt: _createdAt, updatedAt: _updatedAt, ...repoEntry } = entry as CharEntry
  const finalEntry = { ...repoEntry, contributor: nickname }
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(finalEntry, null, 2))))

  await octokit.rest.git.createRef({ owner: OWNER, repo: REPO, ref: `refs/heads/${branch}`, sha: mainSha })

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message: prTitle(char, nickname, mode),
    content,
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  })

  const { data: pr } = await octokit.rest.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: prTitle(char, nickname, mode),
    head: branch,
    base: 'main',
    body: prBody(entry, nickname),
  })

  try {
    await octokit.rest.pulls.requestReviewers({
      owner: OWNER,
      repo: REPO,
      pull_number: pr.number,
      reviewers: [OWNER],
    })
  } catch { /* non-fatal */ }

  return pr.html_url
}

export function getPRListUrl() {
  return `https://github.com/${OWNER}/${REPO}/pulls`
}
