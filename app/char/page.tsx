"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CharPageClient } from './[char]/CharPageClient'
import type { CharEntry, ExternalChar } from '@/lib/types'
import type { LexiconData } from '@/lib/lexicon'

type CVDict = Record<string, { trad: string; pinyin: string; vi: string }>

type State =
  | { status: 'loading' }
  | { status: 'ready'; curated: CharEntry | null; external: ExternalChar | null; char: string; lexicon: LexiconData | null }
  | { status: 'not-found' }

// Browser-safe lexicon: cvdict for translation, kVietnamese for sino-viet
// No chinese-lexicon (Node-only). Etymology/components only available on server-rendered pages.
function buildClientLexicon(char: string, cvdict: CVDict, kViet: Record<string, string[]>): LexiconData {
  const cv = cvdict[char]
  const sv = kViet[char]
  return {
    trad: cv?.trad && cv.trad !== char ? cv.trad : undefined,
    sino_vietnamese: sv?.[0] ?? undefined,
    translation_vi: cv?.vi || undefined,
  }
}

function CharQueryPage() {
  const params = useSearchParams()
  const char = params.get('c') ?? ''
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!char) { setState({ status: 'not-found' }); return }

    Promise.all([
      fetch('/chars/index.json').then(r => r.json() as Promise<CharEntry[]>),
      fetch('/data/kVietnamese.json').then(r => r.json() as Promise<Record<string, string[]>>),
      fetch('/data/cvdict.json').then(r => r.json() as Promise<CVDict>),
    ]).then(([index, kViet, cvdict]) => {
      const raw = index.find((e: CharEntry) => e.char === char) ?? null
      const curated = raw ? { ...raw, source: 'repo' as const } : null
      const sv = kViet[char]
      const external: ExternalChar | null = curated
        ? null
        : sv ? { char, sino_vietnamese: sv, source: 'kVietnamese' } : null
      if (!curated && !external) { setState({ status: 'not-found' }); return }
      const lexicon = buildClientLexicon(char, cvdict, kViet)
      setState({ status: 'ready', curated, external, char, lexicon })
    }).catch(() => setState({ status: 'not-found' }))
  }, [char])

  if (state.status === 'loading') {
    return <div className="flex-1 flex items-center justify-center text-sm text-[#888]">Đang tải…</div>
  }

  if (state.status === 'not-found') {
    return <div className="flex-1 flex items-center justify-center text-sm text-[#888]">Không tìm thấy.</div>
  }

  return (
    <CharPageClient
      curated={state.curated}
      external={state.external}
      char={state.char}
      lexicon={state.lexicon}
    />
  )
}

export default function CharQueryPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-[#888]">Đang tải…</div>}>
      <CharQueryPage />
    </Suspense>
  )
}
