"use client"

import { RotateCcw } from 'lucide-react'
import type { CharEntry } from '@/lib/types'

interface Props {
    localChar: CharEntry
    onReset: () => void
    onDelete: () => void
    resetting: boolean
}

export function DangerZone({ localChar, onReset, onDelete, resetting }: Props) {
    return (
        <div className="flex items-center justify-center gap-6 pt-2 pb-4">
            {localChar.copiedFrom && !localChar.copiedFrom.startsWith('gen:') && (
                <button
                    onClick={onReset}
                    disabled={resetting}
                    className="flex items-center gap-1.5 text-xs text-[#BBB] hover:text-[#888] disabled:opacity-40 transition-colors"
                >
                    <RotateCcw size={12}/>
                    {resetting ? 'Đang khôi phục…' : 'Khôi phục bản gốc'}
                </button>
            )}
            <button
                onClick={onDelete}
                className="text-xs text-[#BBB] hover:text-red-500 underline underline-offset-2 transition-colors"
            >
                Xóa khỏi thiết bị
            </button>
        </div>
    )
}
