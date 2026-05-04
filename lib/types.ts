export interface CharEntry {
  char: string
  pinyin: string
  sino_vietnamese: string
  strokes: number
  radical: string
  components: string[]
  etymology: {
    vi: string
    en: string
  }
  notes: string
  tags: string[]
  contributor: string
  sources: string[]
}

export interface ExternalChar {
  char: string
  sino_vietnamese: string[]
  source: 'kVietnamese'
}

export type SearchResult =
  | { type: 'curated'; entry: CharEntry }
  | { type: 'external'; entry: ExternalChar }
