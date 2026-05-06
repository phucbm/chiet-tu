"use client"

import { Copy } from 'lucide-react'

export function ClonePrompt({ onClone }: { onClone: () => void }) {
    return (
        <div className="px-5 pb-6 space-y-4">
            <p className="text-sm text-[#888] leading-relaxed">
                Tạo bản sao của chữ này về thiết bị để chỉnh sửa. Bản gốc trong repo không bị ảnh hưởng.
            </p>
            <button
                onClick={onClone}
                className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
            >
                <Copy size={15}/>
                Lưu về thiết bị
            </button>
        </div>
    )
}
