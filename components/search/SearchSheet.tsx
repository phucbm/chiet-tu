"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { isSearchShortcut } from '@/lib/keys'
import { MagnifyingGlass, PenNib } from '@phosphor-icons/react'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { HanziInput } from '@/components/hanzi/HanziInput'
import { cn } from '@/lib/utils'
import { searchChars } from '@/lib/client-dictionary'
import type { SearchResult } from '@/lib/types'
import { useRouter } from 'next/navigation'

type SearchMode = 'text' | 'draw'

function ResultItem({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: (char: string) => void
}) {
  const char = result.entry.char
  const sv = result.entry.sino_vietnamese
  const pinyin = 'pinyin' in result.entry ? result.entry.pinyin : ''
  const isCurated = result.type === 'curated' && result.entry.source === 'repo'

  return (
    <button
      onClick={() => onSelect(char)}
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F0EC] transition-colors text-left"
    >
      <span className="text-2xl w-9 text-center leading-none shrink-0">{char}</span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-[#0F0F0F]">{sv || char}</span>
        {pinyin && <span className="text-xs text-[#888]">{pinyin}</span>}
      </span>
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
          isCurated
            ? 'bg-green-100 text-green-700'
            : 'bg-[#F0F0EC] text-[#888]'
        )}
      >
        {isCurated ? 'curated' : 'external'}
      </span>
    </button>
  )
}

function SearchSheetContent() {
  const router = useRouter()
  const { closeAll } = useBottomSheet()
  const [mode, setMode] = useState<SearchMode>('text')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    const r = await searchChars(q)
    setResults(r)
    setSearched(true)
  }, [query])

  const handleSelect = useCallback(
    (char: string) => {
      router.push(`/char/${encodeURIComponent(char)}`)
      closeAll()
    },
    [router, closeAll]
  )

  const handleCandidateClick = useCallback((hanzi: string) => {
    setQuery(prev => prev + hanzi)
    setSearched(false)
    setMode('text')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  return (
    <div className="flex flex-col min-h-[75dvh]">
      {/* Mode tabs */}
      <div className="flex border-b border-[#E0E0DC] px-3 py-2 gap-1 shrink-0">
        {(['text', 'draw'] as SearchMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              mode === m
                ? 'bg-[#E8E8E4] text-[#0F0F0F]'
                : 'text-[#888] hover:text-[#0F0F0F]'
            )}
          >
            {m === 'text' ? <MagnifyingGlass className="size-3" /> : <PenNib className="size-3" />}
            {m === 'text' ? 'Gõ tìm kiếm' : 'Viết tay'}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <>
          {/* Search input */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#E0E0DC] shrink-0">
            <MagnifyingGlass size={16} className="text-[#888] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setSearched(false)
                if (!e.target.value) setResults([])
              }}
              onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
              placeholder="Nhập chữ Hán, pinyin, Hán Việt..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-[#AAA] py-1"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
                className="text-xs text-[#AAA] hover:text-[#555] transition-colors"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Results */}
          <div className="overflow-y-auto">
            {searched && results.length === 0 ? (
              <p className="text-sm text-[#888] text-center py-8">Không tìm thấy kết quả.</p>
            ) : (
              <ul>
                {results.map((r, i) => (
                  <li key={`${r.entry.char}-${i}`}>
                    <ResultItem result={r} onSelect={handleSelect} />
                  </li>
                ))}
              </ul>
            )}
            {!searched && !query && (
              <p className="text-xs text-[#AAA] text-center py-6">Nhập ký tự, pinyin hoặc Hán Việt để tìm.</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 p-5">
          <p className="text-xs text-[#888] self-start">Viết chữ Hán để nhận dạng</p>
          <HanziInput proxyUrl="" onSelect={handleCandidateClick} width={260} height={260} />
        </div>
      )}
    </div>
  )
}

export function useSearchSheet() {
  const { open } = useBottomSheet()
  return useCallback(() => open(<SearchSheetContent />, 'Tìm kiếm'), [open])
}

export function SearchShortcut() {
  const openSearch = useSearchSheet()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isSearchShortcut(e)) {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openSearch])
  return null
}
