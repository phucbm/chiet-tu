"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { CharEntry } from '@/lib/types'

interface CharStore {
  chars: CharEntry[]
  addChar: (char: CharEntry) => void
  updateChar: (char: string, updates: Partial<CharEntry>) => void
  deleteChar: (char: string, localId: string) => void
  cloneFromRepo: (entry: CharEntry) => CharEntry
  cloneFromGen: (entry: CharEntry) => CharEntry
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
          chars: s.chars.map((c) => {
            if (c.char !== char || c.source !== 'local') return c
            const newEdited = Array.from(new Set([
              ...(c.editedFields ?? []),
              ...Object.keys(updates).filter(k => !['source','copiedFrom','createdAt','updatedAt','editedFields'].includes(k)),
            ]))
            return { ...c, ...updates, updatedAt: Date.now(), editedFields: newEdited }
          }),
        })),

      deleteChar: (_char, localId) =>
        set((s) => ({ chars: s.chars.filter((c) => c.createdAt !== Number(localId)) })),

      cloneFromRepo: (entry) => {
        const clone: CharEntry = {
          ...entry,
          source: 'local',
          copiedFrom: entry.char,
          createdAt: Date.now(),
          editedFields: [],
        }
        set((s) => ({ chars: [clone, ...s.chars] }))
        return clone
      },

      cloneFromGen: (entry) => {
        const clone: CharEntry = {
          ...entry,
          source: 'local',
          copiedFrom: `gen:${entry.char}`,
          createdAt: Date.now(),
          editedFields: [],
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
