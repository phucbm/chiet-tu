import { readFile } from 'fs/promises'
import { join } from 'path'
import kVietRaw from '@/data/kVietnamese.json'
import type { CharEntry, ExternalChar, SearchResult } from './types'

const kViet = kVietRaw as Record<string, string[]>

let _index: CharEntry[] | null = null

async function loadIndex(): Promise<CharEntry[]> {
  if (_index) return _index
  try {
    const raw = await readFile(join(process.cwd(), 'public', 'chars', 'index.json'), 'utf-8')
    const parsed: CharEntry[] = JSON.parse(raw)
    _index = parsed.map((e) => ({ ...e, source: 'repo' as const }))
  } catch {
    _index = []
  }
  return _index!
}

export async function getAllChars(): Promise<CharEntry[]> {
  return loadIndex()
}

export async function getChar(char: string): Promise<CharEntry | null> {
  const index = await loadIndex()
  return index.find(e => e.char === char) ?? null
}

export async function getExternalChar(char: string): Promise<ExternalChar | null> {
  const sv = kViet[char]
  if (!sv) return null
  return { char, sino_vietnamese: sv, source: 'kVietnamese' }
}

function isCJK(ch: string) {
  return /[一-鿿㐀-䶿]/.test(ch)
}

export async function searchChars(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []

  const index = await loadIndex()
  const results: SearchResult[] = []
  const seen = new Set<string>()

  for (const entry of index) {
    if (
      entry.char.includes(q) ||
      entry.pinyin.toLowerCase().includes(q.toLowerCase()) ||
      entry.sino_vietnamese.toLowerCase().includes(q.toLowerCase())
    ) {
      seen.add(entry.char)
      results.push({ type: 'curated', entry })
    }
  }

  if (isCJK(q) && q.length === 1 && !seen.has(q)) {
    const ext = await getExternalChar(q)
    if (ext) results.push({ type: 'external', entry: ext })
  }

  if (!isCJK(q)) {
    for (const [char, readings] of Object.entries(kViet)) {
      if (seen.has(char)) continue
      if (readings.some(r => r.toLowerCase().includes(q.toLowerCase()))) {
        seen.add(char)
        results.push({ type: 'external', entry: { char, sino_vietnamese: readings, source: 'kVietnamese' } })
        if (results.length >= 20) break
      }
    }
  }

  return results.slice(0, 20)
}
