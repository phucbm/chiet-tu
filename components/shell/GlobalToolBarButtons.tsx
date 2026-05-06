"use client"

import { ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react'
import { useSearchSheet } from '@/components/search/SearchSheet'
import { useHistorySheet } from '@/components/history/HistorySheet'
import { useGlobalToolBarSlot } from './ToolBarSlot'

export function GlobalToolBarButtons() {
  const openSearch = useSearchSheet()
  const openHistory = useHistorySheet()
  useGlobalToolBarSlot([
    { icon: <MagnifyingGlass size={20} />, label: 'Search', position: 'right', onClick: openSearch },
    { icon: <ClockCounterClockwise size={20} />, label: 'History', position: 'right', onClick: openHistory },
  ])
  return null
}
