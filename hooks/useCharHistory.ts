"use client"

import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db, type CharHistoryEntry } from '@/lib/db'
import type { CharEntry } from '@/lib/types'

const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

// Guard against concurrent calls for same char
const inFlight = new Set<string>()

export function useCharHistory() {
  const entries = useLiveQuery(
    () =>
      db.charHistory
        .orderBy('viewedAt')
        .reverse()
        .toArray()
        .then(rows => {
          const best = new Map<string, CharHistoryEntry>()
          for (const row of rows) {
            const existing = best.get(row.char)
            if (!existing || (row.viewCount ?? 0) > (existing.viewCount ?? 0)) {
              best.set(row.char, row)
            }
          }
          return Array.from(best.values())
        }),
    [],
    []
  )

  const addView = useCallback(async (entry: CharEntry) => {
    const char = entry.char
    if (inFlight.has(char)) {
      console.log('[history] skip, in-flight:', char)
      return
    }
    inFlight.add(char)

    try {
      const existing = await db.charHistory.get(char)
      console.log('[history] existing for', char, existing)
      await db.charHistory.put({
        char,
        sino_vietnamese: entry.sino_vietnamese ?? '',
        pinyin: entry.pinyin ?? '',
        viewedAt: Date.now(),
        viewCount: existing ? (existing.viewCount ?? 0) + 1 : 1,
        source: (entry.source as CharHistoryEntry['source']) ?? 'dictionary',
      })
      console.log('[history] put done, viewCount should be', existing ? existing.viewCount + 1 : 1)
    } finally {
      inFlight.delete(char)
    }

    const cutoff = Date.now() - MAX_AGE_MS
    db.charHistory.where('viewedAt').below(cutoff).delete()
  }, [])

  const clear = useCallback(() => db.charHistory.clear(), [])

  const search = useCallback(
    (q: string): CharHistoryEntry[] => {
      if (!entries || !q.trim()) return entries ?? []
      const lower = q.toLowerCase()
      return entries.filter(
        e =>
          e.char.includes(lower) ||
          e.sino_vietnamese.toLowerCase().includes(lower)
      )
    },
    [entries]
  )

  return { entries, addView, clear, search }
}