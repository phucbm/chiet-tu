import { createRequire } from 'module'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const require = createRequire(import.meta.url)

const { getEntries } = require('chinese-lexicon')

const DATA_DIR = join(process.cwd(), 'data')
const OUT_DIR = join(process.cwd(), 'public', 'data')

const [kVietRaw, cvdictRaw, overridesRaw] = await Promise.all([
  readFile(join(DATA_DIR, 'kVietnamese.json'), 'utf-8').then(JSON.parse),
  readFile(join(DATA_DIR, 'cvdict.json'), 'utf-8').then(JSON.parse),
  readFile(join(DATA_DIR, 'sinoViet-overrides.json'), 'utf-8').then(JSON.parse),
])

const kViet = kVietRaw
const cvdict = cvdictRaw
const overrides = overridesRaw

function isSingleCJK(s) {
  return s.length === 1 && /[一-鿿㐀-䶿]/.test(s)
}

function getSV(char, trad) {
  return (
    kViet[char]?.[0] ??
    (trad && trad !== char ? kViet[trad]?.[0] : undefined) ??
    overrides[char]?.[0] ??
    (trad && trad !== char ? overrides[trad]?.[0] : undefined) ??
    undefined
  )
}

const entries = []

for (const char of Object.keys(kViet)) {
  if (!isSingleCJK(char)) continue

  const lexEntries = getEntries(char)
  const lex = lexEntries?.[0]

  const trad = lex?.trad !== char ? lex?.trad : undefined
  const sv = getSV(char, trad)
  const vi = cvdict[char]?.vi || undefined
  const en = lex?.definitions?.length ? lex.definitions.slice(0, 5) : undefined
  const note = lex?.simpEtymology?.notes || undefined
  const related = lex?.statistics?.topWords
    ?.filter(w => w.word !== char && isSingleCJK(w.word))
    .slice(0, 8)
    .map(w => w.word)

  const comps = (lex?.simpEtymology?.components ?? [])
    .filter(c => c.char && isSingleCJK(c.char))
    .map(c => {
      const compSV = getSV(c.char)
      const obj = { c: c.char }
      if (c.type === 'meaning') obj.n = 'ý'
      else if (c.type === 'sound') obj.n = 'âm'
      if (c.pinyin) obj.p = c.pinyin
      if (compSV) obj.sv = compSV
      if (c.definition) obj.t = c.definition
      return obj
    })

  const record = { s: char }
  if (trad) record.t = trad
  if (lex?.pinyin) record.p = lex.pinyin
  if (sv) record.sv = sv
  if (vi) record.vi = vi
  if (en) record.en = en
  if (note) record.note = note
  if (comps.length) record.comps = comps
  if (related?.length) record.related = related

  entries.push(record)
}

await mkdir(OUT_DIR, { recursive: true })
await writeFile(join(OUT_DIR, 'dictionary.json'), JSON.stringify(entries))
console.log(`built dictionary: ${entries.length} chars → public/data/dictionary.json`)
