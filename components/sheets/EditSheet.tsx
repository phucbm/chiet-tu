"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowCounterClockwise, Plus, Trash } from '@phosphor-icons/react'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { useCharStore } from '@/store/useCharStore'
import type { CharEntry, EtymologyComponent } from '@/lib/types'

const RAW_BASE = 'https://raw.githubusercontent.com/phucbm/chiet-tu/main'

const inputCls =
  'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'
const textareaCls = inputCls + ' resize-none'

interface Props {
  char: CharEntry
}

function ComponentRow({
  comp,
  onChange,
  onRemove,
}: {
  comp: EtymologyComponent
  onChange: (c: EtymologyComponent) => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#F8F7F5] border border-[#E0E0DC] rounded-xl">
      <div className="flex gap-2">
        <input
          className={inputCls + ' w-16 text-center text-xl'}
          placeholder="字"
          value={comp.char}
          onChange={e => onChange({ ...comp, char: e.target.value })}
          maxLength={1}
        />
        <input
          className={inputCls + ' flex-1'}
          placeholder="Tên thành phần (ý nghĩa, âm thanh...)"
          value={comp.componentName}
          onChange={e => onChange({ ...comp, componentName: e.target.value })}
        />
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl text-[#BBB] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#E0E0DC]"
        >
          <Trash size={14} />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className={inputCls + ' flex-1'}
          placeholder="Pinyin"
          value={comp.pinyin}
          onChange={e => onChange({ ...comp, pinyin: e.target.value })}
        />
        <input
          className={inputCls + ' flex-1'}
          placeholder="Hán Việt"
          value={comp.sino_vietnamese}
          onChange={e => onChange({ ...comp, sino_vietnamese: e.target.value })}
        />
      </div>
      <input
        className={inputCls}
        placeholder="Nghĩa của thành phần này"
        value={comp.translation}
        onChange={e => onChange({ ...comp, translation: e.target.value })}
      />
    </div>
  )
}

export function EditSheet({ char }: Props) {
  const { updateChar, deleteChar } = useCharStore()
  const { closeAll } = useBottomSheet()
  const { setFooter } = useBottomSheet()

  const [trad, setTrad] = useState(char.trad ?? '')
  const [pinyin, setPinyin] = useState(char.pinyin)
  const [sinoViet, setSinoViet] = useState(char.sino_vietnamese)
  const [strokes, setStrokes] = useState(String(char.strokes ?? ''))
  const [radical, setRadical] = useState(char.radical ?? '')
  const [translationVi, setTranslationVi] = useState(char.translation.vi)
  const [note, setNote] = useState(char.etymology.note)
  const [components, setComponents] = useState<EtymologyComponent[]>(char.etymology.components)
  const [examples, setExamples] = useState(char.etymology.examples.join(', '))
  const [related, setRelated] = useState(char.etymology.related.join(', '))
  const [resetting, setResetting] = useState(false)

  function buildUpdates(): Partial<CharEntry> {
    return {
      trad: trad.trim() || undefined,
      pinyin: pinyin.trim(),
      sino_vietnamese: sinoViet.trim(),
      strokes: strokes ? Number(strokes) : undefined,
      radical: radical.trim() || undefined,
      translation: { vi: translationVi.trim() },
      etymology: {
        note: note.trim(),
        components,
        examples: examples.split(',').map(s => s.trim()).filter(Boolean),
        related: related.split(',').map(s => s.trim()).filter(Boolean),
      },
    }
  }

  function handleSave() {
    updateChar(char.char, buildUpdates())
    closeAll()
  }

  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave

  useEffect(() => {
    setFooter(
      <button
        onClick={() => handleSaveRef.current()}
        className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors"
      >
        Lưu
      </button>
    )
  }, [])

  async function handleReset() {
    if (!char.copiedFrom || char.copiedFrom.startsWith('gen:')) return
    if (!window.confirm('Khôi phục về phiên bản gốc từ GitHub? Mọi chỉnh sửa local sẽ mất.')) return
    setResetting(true)
    try {
      const res = await fetch(`${RAW_BASE}/chars/${encodeURIComponent(char.copiedFrom)}.json`)
      if (!res.ok) throw new Error('Not found')
      const original: CharEntry = await res.json()
      updateChar(char.char, { ...original, source: 'local', copiedFrom: char.copiedFrom })
      closeAll()
    } catch {
      window.alert('Không thể tải file gốc từ GitHub.')
    } finally {
      setResetting(false)
    }
  }

  function handleDelete() {
    if (!window.confirm(`Xóa ${char.char} khỏi thiết bị? Dữ liệu repo không bị ảnh hưởng.`)) return
    deleteChar(char.char, String(char.createdAt ?? 0))
    closeAll()
  }

  function addComponent() {
    setComponents(prev => [
      ...prev,
      { char: '', componentName: '', pinyin: '', sino_vietnamese: '', translation: '' },
    ])
  }

  return (
    <div className="px-5 pb-4 space-y-4">
      {/* Top actions */}
      <div className="flex justify-between items-center -mb-1">
        {char.copiedFrom && !char.copiedFrom.startsWith('gen:') ? (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#0F0F0F] disabled:opacity-40 transition-colors"
          >
            <ArrowCounterClockwise size={13} />
            {resetting ? 'Đang khôi phục…' : 'Khôi phục bản gốc'}
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Giản thể</label>
          <div className={`${inputCls} bg-[#F0F0EC] text-[#888] cursor-not-allowed`}>{char.char}</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Phồn thể</label>
          <input
            className={inputCls}
            placeholder="—"
            value={trad}
            onChange={e => setTrad(e.target.value)}
            maxLength={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Pinyin</label>
          <input className={inputCls} placeholder="zhōng" value={pinyin} onChange={e => setPinyin(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Hán Việt</label>
          <input className={inputCls} placeholder="trung" value={sinoViet} onChange={e => setSinoViet(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Số nét</label>
          <input className={inputCls} type="number" placeholder="4" value={strokes} onChange={e => setStrokes(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Bộ thủ</label>
          <input className={inputCls} placeholder="丨" value={radical} onChange={e => setRadical(e.target.value)} maxLength={2} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Nghĩa (tiếng Việt)</label>
        <input className={inputCls} placeholder="ở giữa, trung tâm" value={translationVi} onChange={e => setTranslationVi(e.target.value)} />
      </div>

      {/* Etymology */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Chú thích chiết tự</label>
        <textarea
          className={`${textareaCls} min-h-[80px]`}
          placeholder="Giải thích nguồn gốc chữ..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {/* Components repeater */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#888]">Thành phần ({components.length})</label>
          <button
            onClick={addComponent}
            className="flex items-center gap-1 text-xs text-[#0F0F0F] hover:opacity-70 transition-opacity"
          >
            <Plus size={12} />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {components.map((comp, i) => (
            <ComponentRow
              key={i}
              comp={comp}
              onChange={updated => setComponents(prev => prev.map((c, j) => j === i ? updated : c))}
              onRemove={() => setComponents(prev => prev.filter((_, j) => j !== i))}
            />
          ))}
          {components.length === 0 && (
            <p className="text-xs text-[#AAA] text-center py-2">Chưa có thành phần.</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Ví dụ (cách nhau bởi dấu phẩy)</label>
        <input className={inputCls} placeholder="中国, 中文, 中心" value={examples} onChange={e => setExamples(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Từ liên quan (cách nhau bởi dấu phẩy)</label>
        <input className={inputCls} placeholder="央, 间, 内" value={related} onChange={e => setRelated(e.target.value)} />
      </div>

      <div className="flex justify-center pt-1 pb-2">
        <button
          onClick={handleDelete}
          className="text-xs text-[#BBB] hover:text-red-500 underline underline-offset-2 transition-colors"
        >
          Xóa {char.char} khỏi thiết bị
        </button>
      </div>
    </div>
  )
}
