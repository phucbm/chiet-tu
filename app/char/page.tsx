"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CharPageClient } from './[char]/CharPageClient'
import type { CharEntry, ExternalChar } from '@/lib/types'

type State =
  | { status: 'loading' }
  | { status: 'ready'; curated: CharEntry | null; external: ExternalChar | null; char: string }
  | { status: 'not-found' }

function CharQueryPage() {
  const params = useSearchParams()
  const char = params.get('c') ?? ''
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!char) { setState({ status: 'not-found' }); return }

    Promise.all([
      fetch('/chars/index.json').then(r => r.json() as Promise<CharEntry[]>),
      fetch('/data/kVietnamese.json').then(r => r.json() as Promise<Record<string, string[]>>),
    ]).then(([index, kViet]) => {
      const curated = index.find(e => e.char === char) ?? null
      const sv = kViet[char]
      const external: ExternalChar | null = curated
        ? null
        : sv ? { char, sino_vietnamese: sv, source: 'kVietnamese' } : null
      if (!curated && !external) { setState({ status: 'not-found' }); return }
      setState({ status: 'ready', curated, external, char })
    }).catch(() => setState({ status: 'not-found' }))
  }, [char])

  if (state.status === 'loading') {
    return <div className="h-full flex items-center justify-center text-sm text-[#888]">Đang tải…</div>
  }

  if (state.status === 'not-found') {
    return <div className="h-full flex items-center justify-center text-sm text-[#888]">Không tìm thấy.</div>
  }

  return <CharPageClient curated={state.curated} external={state.external} char={state.char} />
}

export default function CharQueryPageWrapper() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-sm text-[#888]">Đang tải…</div>}>
      <CharQueryPage />
    </Suspense>
  )
}
