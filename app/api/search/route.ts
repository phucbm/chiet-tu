import { searchChars } from '@/lib/chars'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') ?? ''
  const results = await searchChars(q)
  return Response.json(results)
}
