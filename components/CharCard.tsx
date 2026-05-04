import Link from 'next/link'
import type { CharEntry } from '@/lib/types'

interface Props {
  entry: CharEntry
  onClick?: () => void
}

const cardCls =
  'flex flex-col items-center gap-1 px-4 py-4 bg-white border border-[#E0E0DC] rounded-xl hover:border-[#0F0F0F] transition-all shadow-sm active:scale-[0.97] cursor-pointer'

export function CharCard({ entry, onClick }: Props) {
  const inner = (
    <>
      <span className="text-4xl leading-none">{entry.char}</span>
      <span className="text-xs text-[#888] font-medium">{entry.sino_vietnamese}</span>
      <span className="text-[10px] text-[#BBB]">{entry.pinyin}</span>
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={cardCls}>
        {inner}
      </button>
    )
  }

  return (
    <Link
      href={`/char/${encodeURIComponent(entry.char)}`}
      className={cardCls}
    >
      {inner}
    </Link>
  )
}

export function CharCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-1 px-4 py-4 bg-white border border-[#E0E0DC] rounded-xl">
      <div className="w-10 h-10 bg-[#E8E8E4] rounded" />
      <div className="h-3 w-12 bg-[#E8E8E4] rounded mt-1" />
      <div className="h-2.5 w-10 bg-[#E8E8E4] rounded" />
    </div>
  )
}
