"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { CharEntry, ExternalChar } from '@/lib/types'

interface CharStore {
  chars: CharEntry[]
  addChar: (char: CharEntry) => void
  updateChar: (char: string, updates: Partial<CharEntry>) => void
  deleteChar: (char: string, localId: string) => void
  cloneFromRepo: (entry: CharEntry) => CharEntry
  cloneFromGen: (entry: ExternalChar) => CharEntry
  findLocal: (char: string) => CharEntry | undefined
}

export const useCharStore = create<CharStore>()(
  persist(
    (set, get) => ({
      chars: [],

      addChar: (char) =>
        set((s) => ({ chars: [char, ...s.chars] })),

      updateChar: (char, updates) =>
        set((s) => ({
          chars: s.chars.map((c) =>
            c.char === char && c.source === 'local'
              ? { ...c, ...updates, updatedAt: Date.now() }
              : c
          ),
        })),

      deleteChar: (_char, localId) =>
        set((s) => ({ chars: s.chars.filter((c) => c.createdAt !== Number(localId)) })),

      cloneFromRepo: (entry) => {
        const clone: CharEntry = {
          ...entry,
          source: 'local',
          copiedFrom: entry.char,
          createdAt: Date.now(),
        }
        set((s) => ({ chars: [clone, ...s.chars] }))
        return clone
      },

      cloneFromGen: (entry) => {
        const clone: CharEntry = {
          char: entry.char,
          pinyin: '',
          sino_vietnamese: entry.sino_vietnamese[0] ?? '',
          translation: { vi: '' },
          etymology: { note: '', components: [], examples: [], related: [] },
          tags: [],
          sources: ['kVietnamese'],
          source: 'local',
          copiedFrom: `gen:${entry.char}`,
          createdAt: Date.now(),
        }
        set((s) => ({ chars: [clone, ...s.chars] }))
        return clone
      },

      findLocal: (char) =>
        get().chars.find((c) => c.char === char && c.source === 'local'),
    }),
    {
      name: 'chiettu_chars',
      partialize: (s) => ({ chars: s.chars }),
    }
  )
)
