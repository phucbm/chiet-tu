export interface EtymologyComponent {
  char: string
  componentName: string
  pinyin: string
  sino_vietnamese: string
  translation: string
}

export interface CharEntry {
  char: string
  trad?: string
  pinyin: string
  sino_vietnamese: string
  strokes?: number
  radical?: string
  translation: { vi: string }
  etymology: {
    note: string
    components: EtymologyComponent[]
    examples: string[]
    related: string[]
  }
  tags: string[]
  contributor?: string
  sources: string[]
  // runtime/local-only — not persisted in repo JSON files
  source?: 'repo' | 'local'
  copiedFrom?: string
  createdAt?: number
  updatedAt?: number
}

export interface ExternalChar {
  char: string
  sino_vietnamese: string[]
  source: 'kVietnamese'
}

export type SearchResult =
  | { type: 'curated'; entry: CharEntry }
  | { type: 'external'; entry: ExternalChar }
