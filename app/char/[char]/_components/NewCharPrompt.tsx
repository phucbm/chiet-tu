"use client"

import { Copy } from 'lucide-react'
import { useBottomSheet } from '@/components/shell/BottomSheet'

interface Props {
    c: string
    onConfirm: () => void
}

export function NewCharPrompt({ c, onConfirm }: Props) {
    const { close } = useBottomSheet()
    return (
        <div className="px-5 pb-6 space-y-4">
            <p className="text-sm text-[#888] leading-relaxed">
                Chữ <span className="text-[#0F0F0F] font-medium">{c}</span> chưa có dữ liệu. Lưu về thiết bị để bắt đầu đóng góp?
            </p>
            <div className="flex flex-col gap-2">
                <button
                    onClick={onConfirm}
                    className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                >
                    <Copy size={15}/>
                    Lưu về thiết bị
                </button>
                <button onClick={close} className="w-full py-3 text-sm text-[#888] hover:text-[#0F0F0F] transition-colors">
                    Huỷ
                </button>
            </div>
        </div>
    )
}
