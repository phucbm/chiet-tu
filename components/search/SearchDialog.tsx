"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { MagnifyingGlass, PenNib } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HanziInput } from '@/components/hanzi/HanziInput'
import type { CharEntry, SearchResult } from '@/lib/types'
import { useRouter } from 'next/navigation'

type SearchMode = 'text' | 'draw'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isDesktop
}

function isCJK(ch: string) {
  return /[一-鿿㐀-䶿]/.test(ch)
}

function searchLocally(
  q: string,
  index: CharEntry[],
  kViet: Record<string, string[]>
): SearchResult[] {
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
    const sv = kViet[q]
    if (sv) results.push({ type: 'external', entry: { char: q, sino_vietnamese: sv, source: 'kVietnamese' } })
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

function ResultItem({ result, onSelect }: { result: SearchResult; onSelect: (char: string) => void }) {
  const char = result.entry.char
  const sv = result.type === 'curated'
    ? result.entry.sino_vietnamese
    : result.entry.sino_vietnamese[0] ?? ''
  const pinyin = result.type === 'curated' ? result.entry.pinyin : ''

  return (
    <button
      onClick={() => onSelect(char)}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
    >
      <span className="text-2xl w-10 text-center leading-none shrink-0">{char}</span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium">{sv || char}</span>
        {pinyin && <span className="text-xs text-muted-foreground">{pinyin}</span>}
      </span>
      <span className={cn(
        'text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
        result.type === 'curated' ? 'bg-green-100 text-green-700' : 'bg-[#F0F0EC] text-[#888]'
      )}>
        {result.type === 'curated' ? 'curated' : 'external'}
      </span>
    </button>
  )
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const isDesktop = useIsDesktop()
  const router = useRouter()

  const [mode, setMode] = useState<SearchMode>('text')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [index, setIndex] = useState<CharEntry[]>([])
  const [kViet, setKViet] = useState<Record<string, string[]>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return
    if (index.length === 0)
      fetch('/chars/index.json').then(r => r.json()).then(setIndex).catch(() => {})
    if (Object.keys(kViet).length === 0)
      fetch('/data/kVietnamese.json').then(r => r.json()).then(setKViet).catch(() => {})
  }, [open])

  useEffect(() => {
    if (open && mode === 'text') {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open, mode])

  const handleSelect = useCallback((char: string) => {
    router.push(`/char/${encodeURIComponent(char)}`)
    onOpenChange(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }, [router, onOpenChange])

  const runSearch = useCallback(() => {
    const q = query.trim()
    if (!q) return
    setResults(searchLocally(q, index, kViet))
    setSearched(true)
  }, [query, index, kViet])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') runSearch()
  }, [runSearch])

  const handleCandidateClick = useCallback((hanzi: string) => {
    setQuery(prev => prev + hanzi)
    setSearched(false)
    inputRef.current?.focus()
  }, [])

  const body = (
    <>
      <div className="flex lg:hidden border-b px-3 py-2 gap-1 shrink-0">
        {(['text', 'draw'] as SearchMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              mode === m ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m === 'text' ? <MagnifyingGlass className="size-3" /> : <PenNib className="size-3" />}
            {m === 'text' ? 'Gõ tìm kiếm' : 'Viết tay'}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className={cn(
          'flex flex-col min-w-0 min-h-0 border-r flex-[3]',
          mode === 'draw' && 'hidden lg:flex'
        )}>
          <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setSearched(false)
                if (!e.target.value) setResults([])
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập chữ Hán, pinyin, Hán Việt..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
            />
            <Button size="sm" onClick={runSearch} disabled={!query.trim()}>
              <MagnifyingGlass className="size-3.5" />
              Tìm
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searched && results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Không tìm thấy kết quả.</p>
            ) : (
              <ul>
                {results.map((r, i) => (
                  <li key={`${r.entry.char}-${i}`}>
                    <ResultItem result={r} onSelect={handleSelect} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cn(
          'flex flex-col gap-3 p-4 overflow-y-auto flex-[2]',
          mode === 'text' ? 'hidden lg:flex' : 'flex flex-1'
        )}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">Viết tay</p>
          <HanziInput
            proxyUrl=""
            onSelect={handleCandidateClick}
            width={280}
            height={280}
          />
        </div>
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[900px]! h-[85vh]! p-0! gap-0! flex flex-col overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Tìm kiếm</DialogTitle>
          <DialogDescription className="sr-only">Tìm chữ Hán theo ký tự, pinyin hoặc Hán Việt</DialogDescription>
          {body}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]! p-0! gap-0! flex flex-col overflow-hidden rounded-t-xl" showCloseButton={false}>
        <SheetTitle className="sr-only">Tìm kiếm</SheetTitle>
        <SheetDescription className="sr-only">Tìm chữ Hán theo ký tự, pinyin hoặc Hán Việt</SheetDescription>
        {body}
      </SheetContent>
    </Sheet>
  )
}
