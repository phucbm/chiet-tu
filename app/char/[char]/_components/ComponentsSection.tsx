"use client"

import { Plus } from 'lucide-react'
import type { EtymologyComponent } from '@/lib/types'
import { SectionHeader } from './SectionHeader'
import { ComponentRow } from './ComponentRow'
import { CharLink } from './CharLink'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    components: EtymologyComponent[]
    onComponentsChange: (components: EtymologyComponent[]) => void
    displayComponents: EtymologyComponent[]
    knownLinkedChars: Set<string>
    onUnknown: (c: string) => void
}

export function ComponentsSection({ isLocal, isActive, onToggle, components, onComponentsChange, displayComponents, knownLinkedChars, onUnknown }: Props) {
    return (
        <section className="space-y-2">
            <SectionHeader
                label={`Thành phần (${displayComponents.length})`}
                isLocal={isLocal}
                isActive={isActive}
                onToggle={onToggle}
                addBtn={
                    <button
                        onClick={e => { e.stopPropagation(); onComponentsChange([...components, { char: '', componentName: '', pinyin: '', sino_vietnamese: '', translation: '' }]) }}
                        className="flex items-center gap-1 text-xs text-[#0F0F0F] hover:opacity-70 transition-opacity"
                    >
                        <Plus size={12}/> Thêm
                    </button>
                }
            />
            {isActive && isLocal ? (
                <div className="space-y-2">
                    {components.map((comp, i) => (
                        <ComponentRow
                            key={i}
                            comp={comp}
                            onChange={updated => onComponentsChange(components.map((c, j) => j === i ? updated : c))}
                            onRemove={() => onComponentsChange(components.filter((_, j) => j !== i))}
                        />
                    ))}
                    {components.length === 0 && <p className="text-xs text-[#AAA] text-center py-2">Chưa có thành phần.</p>}
                </div>
            ) : (
                <div className={`space-y-2 ${isLocal ? 'cursor-pointer' : ''}`} onClick={isLocal ? onToggle : undefined}>
                    {displayComponents.map((c, i) => (
                        <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-[#F8F7F5] border border-[#E8E8E4] rounded-xl">
                            <CharLink c={c.char} known={knownLinkedChars.has(c.char)} onUnknown={() => onUnknown(c.char)} className="text-2xl leading-none shrink-0 w-8 text-center hover:text-blue-500 transition-colors"/>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {c.sino_vietnamese && <span className="text-sm font-medium">{c.sino_vietnamese}</span>}
                                    {c.pinyin && <span className="text-xs text-[#888]">({c.pinyin})</span>}
                                    {c.componentName && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ECEAE6] text-[#888]">{c.componentName}</span>}
                                </div>
                                {c.translation && <p className="text-xs text-[#666] mt-0.5">{c.translation}</p>}
                            </div>
                        </div>
                    ))}
                    {displayComponents.length === 0 && (
                        <p className="text-sm text-[#BBB] italic">{isLocal ? 'Tap to add…' : '—'}</p>
                    )}
                </div>
            )}
        </section>
    )
}
