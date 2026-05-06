import type { CharEntry, SearchResult } from './types'

interface CompactComp {
  c: string
  n?: string
  p?: string
  sv?: string
  t?: string
}

interface DictEntry {
  s: string
  t?: string
  p?: string
  sv?: string
  vi?: string
  en?: string[]
  note?: string
  comps?: CompactComp[]
  related?: string[]
  hasTrad?: string
  hasSimp?: string
}

let _curated: CharEntry[] | null = null
let _dict: DictEntry[] | null = null
let _dictMap: Map<string, DictEntry> | null = null

async function loadCurated(): Promise<CharEntry[]> {
  if (_curated) return _curated
  try {
    const r = await fetch('/chars/index.json')
    _curated = await r.json()
  } catch {
    _curated = []
  }
  return _curated!
}

async function loadDict(): Promise<{ list: DictEntry[]; map: Map<string, DictEntry> }> {
  if (_dict && _dictMap) return { list: _dict, map: _dictMap }
  try {
    const r = await fetch('/data/dictionary.json')
    _dict = await r.json()
  } catch {
    _dict = []
  }
  _dictMap = new Map(_dict!.map(e => [e.s, e]))
  return { list: _dict!, map: _dictMap }
}

function dictToCharEntry(d: DictEntry): CharEntry {
  return {
    char: d.s,
    trad: d.t,
    pinyin: d.p ?? '',
    sino_vietnamese: d.sv ?? '',
    vi: d.vi ?? '',
    etymology: {
      note: d.note ?? '',
      components: (d.comps ?? []).map(c => ({
        char: c.c,
        componentName: c.n ?? '',
        pinyin: c.p ?? '',
        sino_vietnamese: c.sv ?? '',
        translation: c.t ?? '',
      })),
      related: d.related ?? [],
    },
    definitions_en: d.en,
    hasTrad: d.hasTrad,
    hasSimp: d.hasSimp,
    source: 'dictionary',
  }
}

function isCJK(ch: string) {
  return /[一-鿿㐀-䶿]/.test(ch)
}

function stripTones(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function matchesPinyin(pinyin: string, q: string): boolean {
  const syllables = stripTones(pinyin).toLowerCase().split(/\s+/)
  return syllables.some(s => s === q || s.startsWith(q))
}

function matchesSV(sv: string, q: string): boolean {
  const qStripped = stripTones(q)
  return sv.toLowerCase().split(/\s+/).some(s => {
    const sStripped = stripTones(s)
    return s === q || s.startsWith(q) || sStripped === qStripped || sStripped.startsWith(qStripped)
  })
}

export async function getChar(char: string): Promise<CharEntry | null> {
  const [curated, { map }] = await Promise.all([loadCurated(), loadDict()])
  const c = curated.find(e => e.char === char)
  if (c) return { ...c, source: 'repo' }
  const d = map.get(char)
  if (d) return dictToCharEntry(d)
  return null
}

export async function searchChars(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []

  const [curated, { list }] = await Promise.all([loadCurated(), loadDict()])
  const results: SearchResult[] = []
  const seen = new Set<string>()

  const qLow = q.toLowerCase()

  for (const entry of curated) {
    if (
      entry.char.includes(q) ||
      matchesPinyin(entry.pinyin, qLow) ||
      matchesSV(entry.sino_vietnamese, qLow)
    ) {
      seen.add(entry.char)
      results.push({ type: 'curated', entry: { ...entry, source: 'repo' } })
    }
  }

  for (const d of list) {
    if (seen.has(d.s)) continue
    if (
      d.s === q ||
      (d.p && matchesPinyin(d.p, qLow)) ||
      (d.sv && matchesSV(d.sv, qLow))
    ) {
      if (isCJK(d.s) && (d.s.length === 1 || d.s === q)) {
        seen.add(d.s)
        results.push({ type: 'curated', entry: dictToCharEntry(d) })
        if (results.length >= 30) break
      }
    }
  }

  return results.slice(0, 20)
}

export async function getCurated(): Promise<CharEntry[]> {
  return loadCurated()
}

export async function getDictionary(): Promise<DictEntry[]> {
  const { list } = await loadDict()
  return list
}
