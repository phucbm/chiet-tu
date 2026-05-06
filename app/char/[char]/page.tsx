import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'
import { CharPageClient } from './CharPageClient'
import type { Metadata } from 'next'
import type { CharEntry } from '@/lib/types'

interface DictEntry {
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

async function loadSources(): Promise<{ curated: CharEntry[]; dictMap: Map<string, DictEntry> }> {
  const [curatedRaw, dictRaw] = await Promise.all([
    readFile(join(process.cwd(), 'public', 'chars', 'index.json'), 'utf-8').catch(() => '[]'),
    readFile(join(process.cwd(), 'public', 'data', 'dictionary.json'), 'utf-8'),
  ])
  const curated: CharEntry[] = JSON.parse(curatedRaw)
  const dict: DictEntry[] = JSON.parse(dictRaw)
  return { curated, dictMap: new Map(dict.map(e => [e.s, e])) }
}

export async function generateStaticParams() {
  const { curated, dictMap } = await loadSources()
  const seen = new Set<string>()
  const params: { char: string }[] = []

  for (const e of curated) {
    seen.add(e.char)
    params.push({ char: e.char })
  }
  for (const char of dictMap.keys()) {
    if (!seen.has(char)) params.push({ char })
  }
  return params
}

interface Props {
  params: Promise<{ char: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { char } = await params
  const decoded = decodeURIComponent(char)
  const { curated, dictMap } = await loadSources()
  const entry = curated.find(e => e.char === decoded)
  const sv = entry?.sino_vietnamese ?? dictMap.get(decoded)?.sv ?? ''
  const title = sv ? `${decoded} (${sv}) — Chiết Tự` : `${decoded} — Chiết Tự`
  return { title }
}

export default async function CharPage({ params }: Props) {
  const { char } = await params
  const decoded = decodeURIComponent(char)
  const { curated, dictMap } = await loadSources()

  const curatedEntry = curated.find(e => e.char === decoded)
  const dictEntry = dictMap.get(decoded)
  if (!curatedEntry && !dictEntry) notFound()
  const initialData: CharEntry = curatedEntry
    ? { ...curatedEntry, source: 'repo' }
    : dictToCharEntry(dictEntry!)

  // Collect all chars referenced in this entry
  const linkedChars = [
    ...(initialData.etymology?.components ?? []).map(c => c.char),
    ...(initialData.etymology?.related ?? []),
    ...(initialData.radical ? [initialData.radical] : []),
  ]
  const knownLinkedChars = new Set(
    linkedChars.filter(c => dictMap.has(c) || curated.some(e => e.char === c))
  )

  return <CharPageClient char={decoded} initialData={initialData} knownLinkedChars={knownLinkedChars} />
}
