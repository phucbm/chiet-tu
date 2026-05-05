"use client"

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useSearchSheet } from '@/components/search/SearchSheet'
import { useGlobalToolBarSlot } from './ToolBarSlot'

export function GlobalToolBarButtons() {
  const openSearch = useSearchSheet()
  useGlobalToolBarSlot([
    { icon: <MagnifyingGlass size={20} />, label: 'Search', position: 'right', onClick: openSearch },
  ])
  return null
}
