import 'server-only'

/**
 * lexicon.ts — Local data enrichment for any Han character.
 * SERVER ONLY — chinese-lexicon uses Node.js fs, cannot bundle for browser.
 *
 * Sources:
 *  - chinese-lexicon: etymology notes, components, English defs, related words
 *  - cvdict.json: Vietnamese meanings (CVDICT by ph0ngp)
 *  - kVietnamese.json: Sino-Vietnamese readings (Unihan)
 *  - sinoViet-overrides.json: manual overrides
 */

import { getEntries } from 'chinese-lexicon'
import cvdictRaw from '@/data/cvdict.json'
import kVietnameseRaw from '@/data/kVietnamese.json'
import sinoVietOverridesRaw from '@/data/sinoViet-overrides.json'
import type { EtymologyComponent } from './types'

type CVDictMap = Record<string, { trad: string; pinyin: string; vi: string }>
type KVietMap = Record<string, string[]>

const cvdict = cvdictRaw as CVDictMap
const kVietnamese = kVietnameseRaw as unknown as KVietMap
const sinoVietOverrides = sinoVietOverridesRaw as unknown as KVietMap

export interface LexiconData {
  trad?: string
  pinyin?: string
  sino_vietnamese?: string
  translation_vi?: string
  etymology_note?: string
  etymology_components?: EtymologyComponent[]
  related?: string[]
  definitions_en?: string[]
}

function getSinoVietnamese(char: string, trad?: string): string {
  const tradChar = trad && trad !== char ? trad : undefined
  const readings =
    (kVietnamese[char]?.length ? kVietnamese[char] : undefined) ??
    (tradChar ? kVietnamese[tradChar] : undefined) ??
    sinoVietOverrides[char] ??
    (tradChar ? sinoVietOverrides[tradChar] : undefined)
  return readings?.[0] ?? ''
}

export function getLexiconData(char: string): LexiconData | null {
  const entries = getEntries(char)
  if (!entries || entries.length === 0) return null
  const entry = entries[0]

  const trad = entry.trad !== entry.simp ? entry.trad : undefined
  const sinoViet = getSinoVietnamese(char, trad)
  const translationVi = cvdict[char]?.vi ?? ''

  const components: EtymologyComponent[] = (entry.simpEtymology?.components ?? []).map(c => {
    const compSinoViet = getSinoVietnamese(c.char)
    return {
      char: c.char,
      componentName:
        c.type === 'meaning' ? 'ý nghĩa' : c.type === 'sound' ? 'âm thanh' : 'khác',
      pinyin: c.pinyin ?? '',
      sino_vietnamese: compSinoViet,
      translation: c.definition ?? '',
    }
  })

  const related = (entry.statistics?.topWords ?? [])
    .filter(w => w.word !== char)
    .slice(0, 8)
    .map(w => w.word)

  return {
    trad,
    pinyin: entry.pinyin ?? undefined,
    sino_vietnamese: sinoViet || undefined,
    translation_vi: translationVi || undefined,
    etymology_note: entry.simpEtymology?.notes || undefined,
    etymology_components: components.length > 0 ? components : undefined,
    related: related.length > 0 ? related : undefined,
    definitions_en: entry.definitions?.length ? entry.definitions : undefined,
  }
}
