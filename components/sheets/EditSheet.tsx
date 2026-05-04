"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowCounterClockwise, Plus, Trash } from '@phosphor-icons/react'
import { pinyin } from 'pinyin-pro'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { useCharStore } from '@/store/useCharStore'
import type { CharEntry, EtymologyComponent } from '@/lib/types'

const RAW_BASE = 'https://raw.githubusercontent.com/phucbm/chiet-tu/main'
const HW_DATA_BASE = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0'

const inputCls =
  'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'
const textareaCls = inputCls + ' resize-none'

function sectionLabel(text: string) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-[#AAA]">{text}</p>
}

function autoPinyin(char: string): string {
  if (!char || char.length !== 1) return ''
  try {
    return pinyin(char, { toneType: 'symbol', type: 'string' })
  } catch {
    return ''
  }
}

async function fetchStrokeCount(char: string): Promise<number | null> {
  try {
    const res = await fetch(`${HW_DATA_BASE}/${encodeURIComponent(char)}.json`)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.strokes) ? data.strokes.length : null
  } catch {
    return null
  }
}

interface Props {
  char: CharEntry
}

function draftKey(char: string) {
  return `chiettu_draft_${char}`
}

interface DraftState {
  trad: string
  pinyin: string
  sinoViet: string
  strokes: string
  radical: string
  translationVi: string
  note: string
  components: EtymologyComponent[]
  examples: string
  related: string
}

function saveDraft(char: string, state: DraftState) {
  try { localStorage.setItem(draftKey(char), JSON.stringify(state)) } catch {}
}

function loadDraft(char: string): DraftState | null {
  try {
    const raw = localStorage.getItem(draftKey(char))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearDraft(char: string) {
  try { localStorage.removeItem(draftKey(char)) } catch {}
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
  function handleCharChange(val: string) {
    const updated: EtymologyComponent = { ...comp, char: val }
    if (val.length === 1 && !comp.pinyin) {
      updated.pinyin = autoPinyin(val)
    }
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#F8F7F5] border border-[#E0E0DC] rounded-xl">
      <div className="flex gap-2">
        <input
          className={inputCls + ' w-16 text-center text-xl'}
          placeholder="字"
          value={comp.char}
          onChange={e => handleCharChange(e.target.value)}
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

  const draft = loadDraft(char.char)

  const [trad, setTrad] = useState(draft?.trad ?? char.trad ?? '')
  const [pinyinVal, setPinyinVal] = useState(draft?.pinyin ?? char.pinyin)
  const [sinoViet, setSinoViet] = useState(draft?.sinoViet ?? char.sino_vietnamese)
  const [strokes, setStrokes] = useState(draft?.strokes ?? String(char.strokes ?? ''))
  const [radical, setRadical] = useState(draft?.radical ?? char.radical ?? '')
  const [translationVi, setTranslationVi] = useState(draft?.translationVi ?? char.translation.vi)
  const [note, setNote] = useState(draft?.note ?? char.etymology.note)
  const [components, setComponents] = useState<EtymologyComponent[]>(draft?.components ?? char.etymology.components)
  const [examples, setExamples] = useState(draft?.examples ?? char.etymology.examples.join(', '))
  const [related, setRelated] = useState(draft?.related ?? char.etymology.related.join(', '))
  const [resetting, setResetting] = useState(false)
  const [fetchingStrokes, setFetchingStrokes] = useState(false)
  const [hasDraft, setHasDraft] = useState(!!draft)

  // Auto-save draft on any change
  useEffect(() => {
    const state: DraftState = { trad, pinyin: pinyinVal, sinoViet, strokes, radical, translationVi, note, components, examples, related }
    saveDraft(char.char, state)
    setHasDraft(true)
  }, [trad, pinyinVal, sinoViet, strokes, radical, translationVi, note, components, examples, related])

  async function handleFetchStrokes() {
    if (fetchingStrokes) return
    setFetchingStrokes(true)
    const count = await fetchStrokeCount(char.char)
    if (count !== null) setStrokes(String(count))
    setFetchingStrokes(false)
  }

  function buildUpdates(): Partial<CharEntry> {
    return {
      trad: trad.trim() || undefined,
      pinyin: pinyinVal.trim(),
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
    clearDraft(char.char)
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
      clearDraft(char.char)
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
    clearDraft(char.char)
    closeAll()
  }

  function handleDiscardDraft() {
    clearDraft(char.char)
    setTrad(char.trad ?? '')
    setPinyinVal(char.pinyin)
    setSinoViet(char.sino_vietnamese)
    setStrokes(String(char.strokes ?? ''))
    setRadical(char.radical ?? '')
    setTranslationVi(char.translation.vi)
    setNote(char.etymology.note)
    setComponents(char.etymology.components)
    setExamples(char.etymology.examples.join(', '))
    setRelated(char.etymology.related.join(', '))
    setHasDraft(false)
  }

  function addComponent() {
    setComponents(prev => [
      ...prev,
      { char: '', componentName: '', pinyin: '', sino_vietnamese: '', translation: '' },
    ])
  }

  return (
    <div className="px-5 pb-4 space-y-5">
      {/* Top actions */}
      <div className="flex justify-between items-center -mb-2">
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
        {hasDraft && (
          <button
            onClick={handleDiscardDraft}
            className="text-xs text-[#AAA] hover:text-red-500 transition-colors"
          >
            Bỏ nháp
          </button>
        )}
      </div>

      {/* Draft indicator */}
      {hasDraft && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#888] bg-[#F8F7F5] border border-[#E0E0DC] rounded-xl px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          Đang lưu nháp tự động
        </div>
      )}

      {/* ── Group: Chữ ─────────────────────────────── */}
      <div className="space-y-3">
        {sectionLabel('Chữ')}
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
            <label className="text-xs font-medium text-[#888]">Số nét</label>
            <div className="flex gap-1.5">
              <input
                className={inputCls}
                type="number"
                placeholder="4"
                value={strokes}
                onChange={e => setStrokes(e.target.value)}
              />
              <button
                onClick={handleFetchStrokes}
                disabled={fetchingStrokes}
                title="Lấy từ dữ liệu nét"
                className="shrink-0 px-2.5 rounded-xl border border-[#E0E0DC] text-[#888] hover:text-[#0F0F0F] hover:border-[#0F0F0F] transition-colors text-xs disabled:opacity-40"
              >
                {fetchingStrokes ? '…' : '↺'}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#888]">Bộ thủ</label>
            <input className={inputCls} placeholder="丨" value={radical} onChange={e => setRadical(e.target.value)} maxLength={2} />
          </div>
        </div>
      </div>

      {/* ── Group: Phát âm ─────────────────────────── */}
      <div className="space-y-3">
        {sectionLabel('Phát âm')}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#888]">Pinyin</label>
            <input className={inputCls} placeholder="zhōng" value={pinyinVal} onChange={e => setPinyinVal(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#888]">Hán Việt</label>
            <input className={inputCls} placeholder="trung" value={sinoViet} onChange={e => setSinoViet(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Group: Nghĩa ───────────────────────────── */}
      <div className="space-y-3">
        {sectionLabel('Nghĩa')}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Nghĩa (tiếng Việt)</label>
          <input className={inputCls} placeholder="ở giữa, trung tâm" value={translationVi} onChange={e => setTranslationVi(e.target.value)} />
        </div>
      </div>

      {/* ── Group: Chiết tự ────────────────────────── */}
      <div className="space-y-3">
        {sectionLabel('Chiết tự')}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Chú thích</label>
          <textarea
            className={`${textareaCls} min-h-[80px]`}
            placeholder="Giải thích nguồn gốc chữ..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

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
