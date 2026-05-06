"use client"

import { Trash2 } from 'lucide-react'
import { pinyin as getPinyin } from 'pinyin-pro'
import type { EtymologyComponent } from '@/lib/types'

const inputCls = 'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

function autoPinyin(char: string): string {
    if (!char || char.length !== 1) return ''
    try { return getPinyin(char, { toneType: 'symbol', type: 'string' }) } catch { return '' }
}

interface Props {
    comp: EtymologyComponent
    onChange: (c: EtymologyComponent) => void
    onRemove: () => void
}

export function ComponentRow({ comp, onChange, onRemove }: Props) {
    function handleCharChange(val: string) {
        const updated: EtymologyComponent = { ...comp, char: val }
        if (val.length === 1 && !comp.pinyin) updated.pinyin = autoPinyin(val)
        onChange(updated)
    }
    return (
        <div className="flex flex-col gap-1.5 p-3 bg-[#F8F7F5] border border-[#E0E0DC] rounded-xl" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2">
                <input className={inputCls + ' w-16 text-center text-xl'} placeholder="字" value={comp.char} onChange={e => handleCharChange(e.target.value)} maxLength={1}/>
                <input className={inputCls + ' flex-1'} placeholder="Tên thành phần" value={comp.componentName} onChange={e => onChange({ ...comp, componentName: e.target.value })}/>
                <button onClick={onRemove} className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl text-[#BBB] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#E0E0DC]">
                    <Trash2 size={14}/>
                </button>
            </div>
            <div className="flex gap-2">
                <input className={inputCls + ' flex-1'} placeholder="Pinyin" value={comp.pinyin} onChange={e => onChange({ ...comp, pinyin: e.target.value })}/>
                <input className={inputCls + ' flex-1'} placeholder="Hán Việt" value={comp.sino_vietnamese} onChange={e => onChange({ ...comp, sino_vietnamese: e.target.value })}/>
            </div>
            <input className={inputCls} placeholder="Nghĩa" value={comp.translation} onChange={e => onChange({ ...comp, translation: e.target.value })}/>
        </div>
    )
}
