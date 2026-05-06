"use client"

import { SectionHeader } from './SectionHeader'

const inputCls = 'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    trad: string
    radical: string
    onTradChange: (v: string) => void
    onRadicalChange: (v: string) => void
    displayTrad: string
    displayRadical: string
}

export function CharMetaSection({ isLocal, isActive, onToggle, trad, radical, onTradChange, onRadicalChange, displayTrad, displayRadical }: Props) {
    const meta = [displayTrad && `Phồn: ${displayTrad}`, displayRadical && `Bộ: ${displayRadical}`].filter(Boolean)
    return (
        <section className="space-y-1.5">
            <SectionHeader label="Chữ" isLocal={isLocal} isActive={isActive} onToggle={onToggle}/>
            {isActive && isLocal ? (
                <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#888]">Phồn thể</label>
                        <input className={inputCls} placeholder="—" value={trad} onChange={e => onTradChange(e.target.value)} maxLength={1} autoFocus/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#888]">Bộ thủ</label>
                        <input className={inputCls} placeholder="丨" value={radical} onChange={e => onRadicalChange(e.target.value)} maxLength={2}/>
                    </div>
                </div>
            ) : (
                <div onClick={isLocal ? onToggle : undefined} className={isLocal ? 'cursor-text' : undefined}>
                    {meta.length > 0
                        ? <p className="text-sm text-[#0F0F0F]">{meta.join(' · ')}</p>
                        : <p className="text-sm text-[#BBB] italic">{isLocal ? 'Tap to add…' : '—'}</p>
                    }
                </div>
            )}
        </section>
    )
}
