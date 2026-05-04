"use client"

import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { ToolBar } from '@/components/shell/ToolBar'
import { AppFooter } from '@/components/shell/AppFooter'
import { CharCard } from '@/components/CharCard'
import { SearchDialog } from '@/components/search/SearchDialog'
import type { CharEntry } from '@/lib/types'
import type { ControlButton } from '@/components/shell/controls'

interface Props {
  chars: CharEntry[]
}

export function HomeClient({ chars }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)

  const buttons: ControlButton[] = [
    {
      icon: <MagnifyingGlass size={22} />,
      label: 'Search',
      position: 'right',
      onClick: () => setSearchOpen(true),
    },
  ]

  return (
    <div className="h-full flex flex-col relative">
      <header className="shrink-0 px-5 pt-6 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Chiết Tự</h1>
        <p className="text-xs text-[#999] mt-0.5">Từ điển nguồn gốc chữ Hán · open source</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3 px-1">
            Curated Characters
          </h2>

          {chars.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-[#888]">No characters yet.</p>
              <a
                href="https://github.com/phucbm/chiet-tu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#0F0F0F] font-medium underline underline-offset-2"
              >
                Be the first contributor →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {chars.map(entry => (
                <CharCard key={entry.char} entry={entry} />
              ))}
            </div>
          )}
        </section>

        <AppFooter />
      </div>

      <ToolBar buttons={buttons} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
