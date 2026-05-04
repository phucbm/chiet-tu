import { contributeChar } from '@/lib/github'
import type { CharEntry } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { entry, nickname, mode } = await req.json() as {
      entry: Partial<CharEntry>
      nickname: string
      mode: 'new' | 'edit'
    }
    if (!entry?.char || !nickname || !mode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const prUrl = await contributeChar(entry, nickname, mode)
    return Response.json({ prUrl })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
