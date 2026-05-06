"use client"

interface Props {
    label: string
    isLocal: boolean
    isActive: boolean
    onToggle: () => void
    addBtn?: React.ReactNode
}

export function SectionHeader({ label, isLocal, isActive, onToggle, addBtn }: Props) {
    return (
        <div
            className={`flex items-center justify-between ${isLocal ? 'cursor-pointer select-none' : ''}`}
            onClick={onToggle}
        >
            <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</h2>
            {isActive && addBtn}
        </div>
    )
}
