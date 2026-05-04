declare module 'chinese-lexicon' {
  interface EtymologyComponent {
    char: string
    type: 'meaning' | 'sound' | 'unknown'
    definition: string
    pinyin: string
  }

  interface EtymologyData {
    notes: string
    definition: string
    components: EtymologyComponent[]
    images: string[]
    pinyin: string
  }

  interface TopWord {
    word: string
    trad: string
    gloss: string
    share: number
  }

  interface Statistics {
    hskLevel?: number
    movieWordRank?: number
    bookWordRank?: number
    topWords?: TopWord[]
  }

  interface LexiconEntry {
    simp: string
    trad: string
    pinyin: string
    pinyinTones: string
    definitions: string[]
    simpEtymology?: EtymologyData
    statistics?: Statistics
  }

  export function search(query: string): LexiconEntry[]
  export function getEntries(simp: string): LexiconEntry[]
}
