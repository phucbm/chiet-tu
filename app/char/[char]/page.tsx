import { notFound } from 'next/navigation'
import { CharPageClient } from './CharPageClient'
import type { Metadata } from 'next'
import { loadSources, dictToCharEntry } from '@/lib/server-dictionary'
import type { CharEntry } from '@/lib/types'

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
