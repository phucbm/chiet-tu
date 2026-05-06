"use client"

import { useState } from 'react'
import { History, Trash2, X } from 'lucide-react'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { useCharHistory } from '@/hooks/useCharHistory'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

function HistoryItem({
  entry,
  onSelect,
  onRemove,
}: {
  entry: { char: string; sino_vietnamese: string; pinyin: string; viewedAt: number; viewCount: number }
  onSelect: (char: string) => void
  onRemove: (char: string) => void
}) {
  const timeAgo = formatTimeAgo(entry.viewedAt)
  const countLabel = entry.viewCount > 1 ? `×${entry.viewCount}` : null
  return (
    <div className="group flex items-center gap-3 px-5 py-3 hover:bg-[#F0F0EC] transition-colors">
      <button
        onClick={() => onSelect(entry.char)}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <span className="text-2xl w-9 text-center leading-none shrink-0">{entry.char}</span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium text-[#0F0F0F]">{entry.sino_vietnamese || entry.char}</span>
          {entry.pinyin && <span className="text-xs text-[#888]">{entry.pinyin}</span>}
        </span>
        <span className="text-[11px] text-[#AAA]">
          {entry.viewCount > 1 && `${entry.viewCount} lượt · `}{timeAgo}
        </span>
      </button>
      <button
        onClick={() => onRemove(entry.char)}
        className="opacity-0 group-hover:opacity-100 text-[#AAA] hover:text-[#0F0F0F] transition-all p-1"
        aria-label="Remove from history"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  const months = Math.floor(days / 30)
  return `${months} tháng trước`
}

function HistorySheetContent() {
  const router = useRouter()
  const { closeAll } = useBottomSheet()
  const { entries, clear } = useCharHistory()
  const [search, setSearch] = useState('')

  const filtered = entries.filter(
    e =>
      !search ||
      e.char.includes(search) ||
      e.sino_vietnamese.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (char: string) => {
    router.push(`/char/${encodeURIComponent(char)}`)
    closeAll()
  }

  const handleRemove = async (char: string) => {
    const { db } = await import('@/lib/db')
    await db.charHistory.where('char').equals(char).delete()
  }

  return (
    <div className="flex flex-col min-h-[60dvh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0DC] shrink-0">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#888]" />
          <span className="text-sm font-medium">Lịch sử xem</span>
          {entries.length > 0 && (
            <span className="text-[11px] text-[#AAA]">({entries.length})</span>
          )}
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => clear()}
            className="flex items-center gap-1 text-xs text-[#AAA] hover:text-[#0F0F0F] transition-colors"
          >
            <Trash2 size={13} />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#E0E0DC] shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Lọc theo chữ hoặc Hán Việt..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#AAA]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[11px] text-[#AAA] hover:text-[#555]">
              Xóa
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <History size={32} className="text-[#DDD]" />
            <p className="text-sm text-[#888]">Chưa xem chữ nào.</p>
            <p className="text-xs text-[#AAA]">Khi bạn xem chữ Hán, nó sẽ xuất hiện ở đây.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#888] text-center py-8">Không tìm thấy kết quả.</p>
        ) : (
          <ul>
            {filtered.map(e => (
              <li key={e.char}>
                <HistoryItem
                  entry={e}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function useHistorySheet() {
  const { open } = useBottomSheet()
  return () => open(<HistorySheetContent />, 'Lịch sử xem')
}