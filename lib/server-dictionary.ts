import 'server-only'
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { CharEntry } from './types'

export interface DictEntry {
  s: string
  t?: string
  p?: string
  sv?: string
  vi?: string
  en?: string[]
  note?: string
  comps?: Array<{ c: string; n?: string; p?: string; sv?: string; t?: string }>
  related?: string[]
  hasTrad?: string
  hasSimp?: string
}

let _dict: DictEntry[] | null = null
let _dictMap: Map<string, DictEntry> | null = null
let _curated: CharEntry[] | null = null

async function loadDict(): Promise<{ list: DictEntry[]; map: Map<string, DictEntry> }> {
  if (_dict && _dictMap) return { list: _dict, map: _dictMap }
  const raw = await readFile(join(process.cwd(), 'public', 'data', 'dictionary.json'), 'utf-8')
  _dict = JSON.parse(raw)
  _dictMap = new Map(_dict!.map(e => [e.s, e]))
  return { list: _dict!, map: _dictMap! }
}

async function loadCurated(): Promise<CharEntry[]> {
  if (_curated) return _curated
  try {
    const raw = await readFile(join(process.cwd(), 'public', 'chars', 'index.json'), 'utf-8')
    _curated = JSON.parse(raw)
  } catch {
    _curated = []
  }
  return _curated!
}

export function dictToCharEntry(d: DictEntry): CharEntry {
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

export async function loadSources(): Promise<{ curated: CharEntry[]; dictMap: Map<string, DictEntry> }> {
  const [curated, { map: dictMap }] = await Promise.all([loadCurated(), loadDict()])
  return { curated, dictMap }
}
