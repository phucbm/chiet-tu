"use client"

import { useEffect } from 'react'
import { ArrowLeft, CopySimple, GitPullRequest, MagnifyingGlass, PencilSimple } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ToolBar } from '@/components/shell/ToolBar'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { EditSheet } from '@/components/sheets/EditSheet'
import { ContributeSheet } from '@/components/contribute/ContributeSheet'
import { useSearchSheet } from '@/components/search/SearchSheet'
import { StrokeBox } from '@/components/StrokeBox'
import { useCharStore } from '@/store/useCharStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CharEntry } from '@/lib/types'
import type { ControlButton } from '@/components/shell/controls'

interface Props {
  char: string
  initialData: CharEntry
}

function ClonePrompt({ onClone }: { onClone: () => void }) {
  return (
    <div className="px-5 pb-6 space-y-4">
      <p className="text-sm text-[#888] leading-relaxed">
        Tạo bản sao của chữ này về thiết bị để chỉnh sửa. Bản gốc trong repo không bị ảnh hưởng.
      </p>
      <button
        onClick={onClone}
        className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
      >
        <CopySimple size={15} />
        Lưu về thiết bị
      </button>
    </div>
  )
}

export function CharPageClient({ char, initialData }: Props) {
  const router = useRouter()
  const { open } = useBottomSheet()
  const openSearch = useSearchSheet()
  const { findLocal, cloneFromRepo, cloneFromGen } = useCharStore()

  const localChar = findLocal(char)
  const curated = initialData.source === 'repo' ? initialData : null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openSearch])

  const entry = localChar ?? initialData

  const sinoViet = entry.sino_vietnamese
  const pinyin = entry.pinyin
  const trad = entry.trad
  const translationVi = entry.translation?.vi
  const etymNote = entry.etymology?.note
  const etymComponents = entry.etymology?.components ?? []
  const examples = entry.etymology?.examples ?? []
  const related = entry.etymology?.related ?? []
  const strokes = entry.strokes
  const radical = entry.radical
  const definitionsEn = initialData.definitions_en

  function openEdit() {
    if (localChar) {
      open(<EditSheet char={localChar} />, `Chỉnh sửa ${char}`)
      return
    }
    open(
      <ClonePrompt
        onClone={() => {
          let clone: CharEntry
          if (curated) {
            clone = cloneFromRepo(curated)
          } else {
            clone = cloneFromGen({ char, sino_vietnamese: [sinoViet], source: 'kVietnamese' })
          }
          open(<EditSheet char={clone} />, `Chỉnh sửa ${char}`)
        }}
      />,
      `Chỉnh sửa ${char}`
    )
  }

  function openContribute() {
    if (!localChar) return
    open(<ContributeSheet char={localChar} repoOriginal={curated} />, `Đóng góp ${char}`)
  }

  const rightButtons: ControlButton[] = [
    ...(localChar
      ? [{ icon: <GitPullRequest size={20} />, label: 'Contribute', position: 'right' as const, onClick: openContribute }]
      : []),
    { icon: <PencilSimple size={20} />, label: 'Edit', position: 'right' as const, onClick: openEdit },
    { icon: <MagnifyingGlass size={20} />, label: 'Search', position: 'right' as const, onClick: openSearch },
  ]

  const buttons: ControlButton[] = [
    { icon: <ArrowLeft size={20} />, label: 'Back', position: 'left', onClick: () => router.push('/') },
    ...rightButtons,
  ]

  return (
    <div className="char-page__wrapper flex-1 flex flex-col relative overflow-hidden" style={{ height: '100%' }}>
      <header className="shrink-0 px-5 pt-4 pb-2">
        <span className="text-sm font-medium text-[#888]">Chiết Tự</span>
      </header>

      <ScrollArea className="char-page__scroll flex-1 px-5 pb-28" style={{ height: '100%' }}>
        <div className="char-page__content space-y-6">
        {/* Hero */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex items-baseline gap-4">
            <span className="text-8xl leading-none">{char}</span>
            {trad && trad !== char && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#AAA] mb-1">phồn thể</span>
                <span className="text-5xl leading-none text-[#888]">{trad}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#666]">
            {sinoViet && <span className="font-medium text-[#0F0F0F]">{sinoViet}</span>}
            {pinyin && sinoViet && <span className="text-[#CCC]">·</span>}
            {pinyin && <span>{pinyin}</span>}
            {strokes && <span className="text-[#CCC]">·</span>}
            {strokes && <span>{strokes} nét</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {initialData.source === 'dictionary' && !localChar && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0F0EC] text-[#888] font-medium">external</span>
            )}
            {localChar && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">local</span>
            )}
          </div>
        </div>

        {/* Stroke animation */}
        <div className="flex justify-center">
          <StrokeBox char={char} />
        </div>

        {/* Translation */}
        {translationVi && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Nghĩa</h2>
            <p className="text-sm text-[#0F0F0F]">{translationVi}</p>
          </section>
        )}

        {/* Etymology note */}
        {etymNote ? (
          <section className="space-y-1.5">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Chiết tự</h2>
            <p className="text-sm leading-relaxed text-[#0F0F0F]">{etymNote}</p>
          </section>
        ) : (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Chiết tự</h2>
            <div className="border border-dashed border-[#E0E0DC] rounded-xl p-4 text-center space-y-2">
              <p className="text-sm text-[#888]">Chưa có dữ liệu chiết tự.</p>
              <button onClick={openEdit} className="text-sm text-[#0F0F0F] font-medium underline underline-offset-2">
                {localChar ? 'Chỉnh sửa ngay →' : 'Lưu về thiết bị để đóng góp →'}
              </button>
            </div>
          </section>
        )}

        {/* Components */}
        {etymComponents.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Thành phần</h2>
            <div className="space-y-2">
              {etymComponents.map((c, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-[#F8F7F5] border border-[#E8E8E4] rounded-xl">
                  <span className="text-2xl leading-none shrink-0 w-8 text-center">{c.char}</span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.sino_vietnamese && <span className="text-sm font-medium">{c.sino_vietnamese}</span>}
                      {c.pinyin && <span className="text-xs text-[#888]">({c.pinyin})</span>}
                      {c.componentName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ECEAE6] text-[#888]">{c.componentName}</span>
                      )}
                    </div>
                    {c.translation && <p className="text-xs text-[#666] mt-0.5">{c.translation}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Ví dụ</h2>
            <div className="flex flex-wrap gap-1.5">
              {examples.map(ex => (
                <span key={ex} className="text-sm px-2.5 py-1 rounded-lg bg-[#F0F0EC] text-[#0F0F0F]">{ex}</span>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Từ liên quan</h2>
            <div className="flex flex-wrap gap-1.5">
              {related.map(r => (
                <span key={r} className="text-sm px-2.5 py-1 rounded-lg bg-white border border-[#E0E0DC] text-[#0F0F0F]">{r}</span>
              ))}
            </div>
          </section>
        )}

        {/* Radical */}
        {radical && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Bộ thủ</h2>
            <span className="text-2xl">{radical}</span>
          </section>
        )}

        {/* English definitions */}
        {definitionsEn?.length && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">English</h2>
            <p className="text-sm text-[#666]">{definitionsEn.slice(0, 3).join(' · ')}</p>
          </section>
        )}

        {curated?.contributor && (
          <p className="text-xs text-[#BBB]">Contributed by {curated.contributor}</p>
        )}
      </div>
      </ScrollArea>

      <ToolBar buttons={buttons} />
    </div>
  )
}
