"use client"

import { History, Search } from 'lucide-react'
import { useSearchSheet } from '@/components/search/SearchSheet'
import { useHistorySheet } from '@/components/history/HistorySheet'
import { useGlobalToolBarSlot } from './ToolBarSlot'

export function GlobalToolBarButtons() {
  const openSearch = useSearchSheet()
  const openHistory = useHistorySheet()
  useGlobalToolBarSlot([
    { icon: <Search size={20} />, label: 'Search', position: 'right', onClick: openSearch },
    { icon: <History size={20} />, label: 'History', position: 'right', onClick: openHistory },
  ])
  return null
}
