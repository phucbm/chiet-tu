"use client"

import { Plus, Trash2 } from 'lucide-react'
import { SectionHeader } from './SectionHeader'
import { CharLink } from './CharLink'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    related: string[]
    onRelatedChange: (related: string[]) => void
    displayRelated: string[]
    knownLinkedChars: Set<string>
    onUnknown: (c: string) => void
}

export function RelatedSection({ isLocal, isActive, onToggle, related, onRelatedChange, displayRelated, knownLinkedChars, onUnknown }: Props) {
    return (
        <section className="space-y-2">
            <SectionHeader
                label="Từ liên quan"
                isLocal={isLocal}
                isActive={isActive}
                onToggle={onToggle}
                addBtn={
                    <button
                        onClick={e => { e.stopPropagation(); onRelatedChange([...related, '']) }}
                        className="flex items-center gap-1 text-xs text-[#0F0F0F] hover:opacity-70 transition-opacity"
                    >
                        <Plus size={12}/> Thêm
                    </button>
                }
            />
            {isActive && isLocal ? (
                <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
                    {related.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 border border-[#E0E0DC] rounded-lg px-2 py-1 bg-white">
                            <input
                                className="w-8 text-sm text-center outline-none bg-transparent"
                                value={r}
                                maxLength={2}
                                onChange={e => onRelatedChange(related.map((x, j) => j === i ? e.target.value : x))}
                            />
                            <button onClick={() => onRelatedChange(related.filter((_, j) => j !== i))} className="text-[#BBB] hover:text-red-500 transition-colors">
                                <Trash2 size={11}/>
                            </button>
                        </div>
                    ))}
                    {related.length === 0 && <p className="text-xs text-[#AAA]">Chưa có từ liên quan.</p>}
                </div>
            ) : (
                <div className={`flex flex-wrap gap-1.5 ${isLocal ? 'cursor-pointer' : ''}`} onClick={isLocal ? onToggle : undefined}>
                    {displayRelated.map(r => (
                        <CharLink key={r} c={r} known={knownLinkedChars.has(r)} onUnknown={() => onUnknown(r)}
                            className="text-sm px-2.5 py-1 rounded-lg bg-white border border-[#E0E0DC] text-[#0F0F0F] hover:border-[#0F0F0F] transition-colors"/>
                    ))}
                    {displayRelated.length === 0 && (
                        <p className="text-sm text-[#BBB] italic">{isLocal ? 'Tap to add…' : '—'}</p>
                    )}
                </div>
            )}
        </section>
    )
}
