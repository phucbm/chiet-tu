"use client"

import { Plus, Trash2 } from 'lucide-react'
import type { Sentence } from '@/lib/types'
import { SectionHeader } from './SectionHeader'

const inputCls = 'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    sentences: Sentence[]
    onSentencesChange: (sentences: Sentence[]) => void
    displaySentences: Sentence[]
}

export function ExamplesSection({ isLocal, isActive, onToggle, sentences, onSentencesChange, displaySentences }: Props) {
    return (
        <section className="space-y-2">
            <SectionHeader
                label={`Ví dụ (${displaySentences.length})`}
                isLocal={isLocal}
                isActive={isActive}
                onToggle={onToggle}
                addBtn={
                    <button
                        onClick={e => { e.stopPropagation(); onSentencesChange([...sentences, { zh: '', vi: '' }]) }}
                        className="flex items-center gap-1 text-xs text-[#0F0F0F] hover:opacity-70 transition-opacity"
                    >
                        <Plus size={12}/> Thêm
                    </button>
                }
            />
            {isActive && isLocal ? (
                <div className="space-y-2">
                    {sentences.map((s, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-3 bg-[#F8F7F5] border border-[#E0E0DC] rounded-xl" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2">
                                <input
                                    className={inputCls + ' flex-1'}
                                    placeholder="Ví dụ tiếng Trung"
                                    value={s.zh}
                                    onChange={e => onSentencesChange(sentences.map((x, j) => j === i ? { ...x, zh: e.target.value } : x))}
                                />
                                <button
                                    onClick={() => onSentencesChange(sentences.filter((_, j) => j !== i))}
                                    className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl text-[#BBB] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#E0E0DC]"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                            <input
                                className={inputCls}
                                placeholder="Nghĩa tiếng Việt (tuỳ chọn)"
                                value={s.vi ?? ''}
                                onChange={e => onSentencesChange(sentences.map((x, j) => j === i ? { ...x, vi: e.target.value || undefined } : x))}
                            />
                        </div>
                    ))}
                    {sentences.length === 0 && <p className="text-xs text-[#AAA] text-center py-2">Chưa có ví dụ.</p>}
                </div>
            ) : (
                <div className={`space-y-1.5 ${isLocal ? 'cursor-pointer' : ''}`} onClick={isLocal ? onToggle : undefined}>
                    {displaySentences.map((s, i) => (
                        <div key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-[#F0F0EC] rounded-lg">
                            <span className="text-sm text-[#0F0F0F]">{s.zh}</span>
                            {s.vi && <span className="text-xs text-[#888]">{s.vi}</span>}
                        </div>
                    ))}
                    {displaySentences.length === 0 && (
                        <p className="text-sm text-[#BBB] italic">{isLocal ? 'Tap to add…' : '—'}</p>
                    )}
                </div>
            )}
        </section>
    )
}
