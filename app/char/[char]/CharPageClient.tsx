"use client"

import { useState } from 'react'
import { ArrowLeft, MagnifyingGlass, PencilSimple, Plus } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ToolBar } from '@/components/shell/ToolBar'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { ContributeSheet } from '@/components/contribute/ContributeSheet'
import { SearchDialog } from '@/components/search/SearchDialog'
import { StrokeBox } from '@/components/StrokeBox'
import type { CharEntry, ExternalChar } from '@/lib/types'
import type { ControlButton } from '@/components/shell/controls'

interface Props {
  char: string
  curated: CharEntry | null
  external: ExternalChar | null
}

export function CharPageClient({ char, curated, external }: Props) {
  const router = useRouter()
  const { open: openSheet } = useBottomSheet()
  const [searchOpen, setSearchOpen] = useState(false)

  const sinoViet = curated?.sino_vietnamese ?? external?.sino_vietnamese[0] ?? ''
  const pinyin = curated?.pinyin ?? ''

  function openContribute() {
    openSheet(
      <ContributeSheet char={char} existing={curated ?? undefined} />,
      curated ? `Edit ${char}` : `Contribute ${char}`
    )
  }

  const buttons: ControlButton[] = [
    {
      icon: curated ? <PencilSimple size={22} /> : <Plus size={22} />,
      label: curated ? 'Edit' : 'Contribute',
      position: 'left',
      onClick: openContribute,
    },
    {
      icon: <MagnifyingGlass size={22} />,
      label: 'Search',
      position: 'right',
      onClick: () => setSearchOpen(true),
    },
  ]

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0F0F0F]/8 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[#888]">Chiết Tự</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-6">
        {/* Character display */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <span className="text-8xl leading-none">{char}</span>
          <div className="flex items-center gap-2 text-sm text-[#666]">
            {sinoViet && <span className="font-medium">{sinoViet}</span>}
            {pinyin && sinoViet && <span className="text-[#CCC]">·</span>}
            {pinyin && <span>{pinyin}</span>}
            {curated?.strokes && <span className="text-[#CCC]">·</span>}
            {curated?.strokes && <span>{curated.strokes} nét</span>}
          </div>
          {!curated && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0F0EC] text-[#888] font-medium">external</span>
          )}
        </div>

        {/* Stroke animation */}
        <div className="flex justify-center">
          <StrokeBox char={char} />
        </div>

        {/* Etymology */}
        {curated ? (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Nguồn gốc</h2>
            {curated.etymology.vi && (
              <p className="text-sm leading-relaxed text-[#0F0F0F]">{curated.etymology.vi}</p>
            )}
            {curated.etymology.en && (
              <p className="text-sm leading-relaxed text-[#666] italic">{curated.etymology.en}</p>
            )}
          </section>
        ) : (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Nguồn gốc</h2>
            <div className="border border-dashed border-[#E0E0DC] rounded-xl p-4 text-center space-y-2">
              <p className="text-sm text-[#888]">Chưa có dữ liệu chiết tự.</p>
              <button
                onClick={openContribute}
                className="text-sm text-[#0F0F0F] font-medium underline underline-offset-2"
              >
                Đóng góp ngay →
              </button>
            </div>
          </section>
        )}

        {/* Components */}
        {curated?.components && curated.components.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Thành phần</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{char}</span>
              <span className="text-[#CCC]">=</span>
              {curated.components.map((c, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#CCC]">+</span>}
                  <span className="text-2xl">{c}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Radical */}
        {curated?.radical && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Bộ thủ</h2>
            <span className="text-2xl">{curated.radical}</span>
          </section>
        )}

        {/* Sources */}
        {curated?.sources && curated.sources.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Nguồn</h2>
            <div className="flex flex-wrap gap-1.5">
              {curated.sources.map(s => (
                <span key={s} className="text-xs px-2 py-1 rounded-lg bg-[#F0F0EC] text-[#666]">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Contributor */}
        {curated?.contributor && (
          <p className="text-xs text-[#BBB]">Contributed by {curated.contributor}</p>
        )}
      </div>

      <ToolBar buttons={buttons} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
