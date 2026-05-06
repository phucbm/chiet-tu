"use client"

import { SectionHeader } from './SectionHeader'

const cls = 'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm resize-none'

interface Props {
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    value: string
    onChange: (v: string) => void
    displayValue: string
}

export function MeaningSection({ isLocal, isActive, onToggle, value, onChange, displayValue }: Props) {
    return (
        <section className="space-y-1.5">
            <SectionHeader label="Nghĩa" isLocal={isLocal} isActive={isActive} onToggle={onToggle}/>
            {isActive && isLocal ? (
                <textarea
                    className={`${cls} min-h-[72px]`}
                    placeholder="ở giữa, trung tâm"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                />
            ) : (
                <div onClick={isLocal ? onToggle : undefined} className={isLocal ? 'cursor-text' : undefined}>
                    {displayValue
                        ? <p className="text-sm text-[#0F0F0F]">{displayValue}</p>
                        : <p className="text-sm text-[#BBB] italic">{isLocal ? 'Tap to add…' : '—'}</p>
                    }
                </div>
            )}
        </section>
    )
}
