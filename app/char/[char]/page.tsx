import { getAllChars, getChar, getExternalChar } from '@/lib/chars'
import { CharPageClient } from './CharPageClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamicParams = false

export async function generateStaticParams() {
  const chars = await getAllChars()
  return chars.map(c => ({ char: encodeURIComponent(c.char) }))
}

interface Props {
  params: Promise<{ char: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { char } = await params
  const decoded = decodeURIComponent(char)
  const entry = await getChar(decoded)
  const title = entry
    ? `${decoded} (${entry.sino_vietnamese}) — Chiết Tự`
    : `${decoded} — Chiết Tự`
  return { title }
}

export default async function CharPage({ params }: Props) {
  const { char } = await params
  const decoded = decodeURIComponent(char)
  const curated = await getChar(decoded)
  const external = curated ? null : await getExternalChar(decoded)

  if (!curated && !external) notFound()

  return <CharPageClient curated={curated} external={external} char={decoded} />
}
