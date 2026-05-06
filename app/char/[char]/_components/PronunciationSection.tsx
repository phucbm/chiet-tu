"use client"

import { SectionHeader } from './SectionHeader'

const inputCls = 'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    pinyinVal: string
    sinoViet: string
    onPinyinChange: (v: string) => void
    onSinoVietChange: (v: string) => void
    displayPinyin: string
    displaySinoViet: string
}

export function PronunciationSection({ isLocal, isActive, onToggle, pinyinVal, sinoViet, onPinyinChange, onSinoVietChange, displayPinyin, displaySinoViet }: Props) {
    return (
        <section className="space-y-1.5">
            <SectionHeader label="Phát âm" isLocal={isLocal} isActive={isActive} onToggle={onToggle}/>
            {isActive && isLocal ? (
                <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#888]">Pinyin</label>
                        <input className={inputCls} placeholder="zhōng" value={pinyinVal} onChange={e => onPinyinChange(e.target.value)} autoFocus/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#888]">Hán Việt</label>
                        <input className={inputCls} placeholder="trung" value={sinoViet} onChange={e => onSinoVietChange(e.target.value)}/>
                    </div>
                </div>
            ) : (
                <div onClick={isLocal ? onToggle : undefined} className={isLocal ? 'cursor-text' : undefined}>
                    <p className="text-sm text-[#0F0F0F]">
                        {[displayPinyin, displaySinoViet].filter(Boolean).join(' · ') ||
                            (isLocal ? <span className="text-[#BBB] italic">Tap to add…</span> : '—')}
                    </p>
                </div>
            )}
        </section>
    )
}
