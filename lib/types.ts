export interface EtymologyComponent {
  char: string
  componentName: string
  pinyin: string
  sino_vietnamese: string
  translation: string
}

export interface Sentence {
  zh: string
  vi?: string
}

export interface CharEntry {
  char: string
  trad?: string
  hasTrad?: string
  hasSimp?: string
  pinyin: string
  sino_vietnamese: string
  strokes?: number
  radical?: string
  vi?: string
  sentences?: Sentence[]
  etymology: {
    note: string
    components: EtymologyComponent[]
    related: string[]
  }
  contributor?: string
  definitions_en?: string[]
  // runtime/local-only — not persisted in repo JSON files
  source?: 'repo' | 'local' | 'dictionary'
  copiedFrom?: string
  createdAt?: number
  updatedAt?: number
  editedFields?: string[]
}

export type SearchResult = { type: 'curated'; entry: CharEntry }
