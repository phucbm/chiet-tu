import Dexie, { type EntityTable } from 'dexie'

export interface CharHistoryEntry {
  char: string
  sino_vietnamese: string
  pinyin: string
  viewedAt: number
  viewCount: number
  source: 'repo' | 'dictionary' | 'local'
}

const db = new Dexie('chiettu_history') as Dexie & {
  charHistory: EntityTable<CharHistoryEntry, 'char'>
}

db.version(1).stores({
  charHistory: 'char, viewedAt',
})

// Bump to force upgrade — if you need a fresh DB, increment this number
const FORCE_VERSION = 4

if (typeof window !== 'undefined') {
  const stored = Number(localStorage.getItem('chiettu_history_version') ?? 0)
  if (stored < FORCE_VERSION) {
    localStorage.setItem('chiettu_history_version', String(FORCE_VERSION))
    db.delete().catch(() => {}).finally(() => {
      window.location.reload()
    })
  }
}

db.version(2).stores({
  charHistory: 'char, viewedAt',
}).upgrade(function(tx: any) {
  return tx.table('charHistory').toCollection().modify(function(r: any) {
    r.viewCount = r.viewCount ?? 1
  })
})

export { db }