"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppFooter } from '@/components/shell/AppFooter'
import { CharCard } from '@/components/CharCard'
import { useCharStore } from '@/store/useCharStore'
import { getCurated } from '@/lib/client-dictionary'
import { useHeaderSlot } from '@/components/shell/HeaderSlot'
import type { CharEntry } from '@/lib/types'

export function HomeClient() {
  const router = useRouter()
  const { chars: localChars } = useCharStore()
  const [chars, setChars] = useState<CharEntry[]>([])

  useHeaderSlot(
    <>
      <h1 className="text-2xl font-bold tracking-tight">Chiết Tự</h1>
      <p className="text-xs text-[#999] mt-0.5">Từ điển nguồn gốc chữ Hán · open source</p>
    </>
  )

  useEffect(() => {
    getCurated().then(setChars).catch(() => {})
  }, [])



  return (
    <>
        <div className="content-home flex-1 flex flex-col relative">

            <div className="home__content pb-28 space-y-6">
                {/* My Characters — HIDDEN: edit feature temporarily disabled */}
                {/* {localChars.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3 px-1">
                            Của tôi
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {localChars.map(entry => (
                                <CharCard
                                    key={`local-${entry.char}-${entry.createdAt}`}
                                    entry={entry}
                                    onClick={() => router.push(`/char/${encodeURIComponent(entry.char)}`)}
                                />
                            ))}
                        </div>
                    </section>
                )} */}

                {/* All Characters */}
                <section>
                    <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3 px-1">
                        Curated Characters
                    </h2>

                    {chars.length === 0 ? (
                        <div className="py-10 flex flex-col items-center gap-3 text-center">
                            <p className="text-sm text-[#888]">Chưa có chữ nào.</p>
                            <a
                                href="https://github.com/phucbm/chiet-tu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#0F0F0F] font-medium underline underline-offset-2"
                            >
                                Đóng góp ngay →
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {chars.map(entry => (
                                <CharCard key={entry.char} entry={entry} />
                            ))}
                        </div>
                    )}
                </section>

                <AppFooter />
            </div>
        </div>
    </>
  )
}
