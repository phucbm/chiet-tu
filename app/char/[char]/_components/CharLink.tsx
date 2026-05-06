"use client"

interface Props {
    c: string
    known: boolean
    onUnknown: () => void
    className?: string
}

export function CharLink({ c, known, onUnknown, className }: Props) {
    if (known) return <a href={`/char/${encodeURIComponent(c)}`} className={className}>{c}</a>
    return <span onClick={onUnknown} className={`cursor-pointer ${className ?? ''}`}>{c}</span>
}
