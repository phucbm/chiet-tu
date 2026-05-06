import { createRequire } from 'module'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'

const require = createRequire(import.meta.url)
const { getEntries } = require('chinese-lexicon')

const DATA_DIR = join(process.cwd(), 'data')
const OUT_DIR = join(process.cwd(), 'public', 'data')

// ─── Load sources ────────────────────────────────────────────────────────────

console.log('\n[1/3] Loading source files...')
const [kVietRaw, cvdictRaw] = await Promise.all([
  readFile(join(DATA_DIR, 'kVietnamese.json'), 'utf-8').then(JSON.parse),
  readFile(join(DATA_DIR, 'cvdict.json'), 'utf-8').then(JSON.parse),
])
console.log(`  kVietnamese: ${Object.keys(kVietRaw).length} chars`)
console.log(`  cvdict:      ${Object.keys(cvdictRaw).length} chars`)

function isSingleCJK(s) {
  // BMP CJK blocks + supplementary planes (Extension B–F, Compatibility Ideographs)
  return /^\p{Script=Han}$/u.test(s)
}

function getSV(char, trad) {
  return (
    kVietRaw[char]?.[0] ??
    (trad && trad !== char ? kVietRaw[trad]?.[0] : undefined) ??
    undefined
  )
}

function buildRecord(char, lex, sv) {
  const trad = lex?.trad !== char ? lex?.trad : undefined
  const vi = cvdictRaw[char]?.vi || undefined
  const en = lex?.definitions?.length ? lex.definitions : undefined
  const note = lex?.simpEtymology?.notes || undefined
  const related = lex?.statistics?.topWords
    ?.filter(w => w.word !== char && /\p{Script=Han}/u.test(w.word))
    .slice(0, 10)
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
  return record
}

// ─── Step 1+2: Build entries from cvdict (primary), enrich with kViet + lexicon ──

console.log('\n[2/3] Building entries from cvdict + chinese-lexicon...')
const entries = []
const byChar = new Map()

for (const char of Object.keys(cvdictRaw)) {
  if (!isSingleCJK(char)) continue
  const lexEntries = getEntries(char)
  const lex = lexEntries?.[0]
  const sv = getSV(char, lex?.trad !== char ? lex?.trad : undefined)
  const record = buildRecord(char, lex, sv)
  entries.push(record)
  byChar.set(char, record)
}

console.log(`  Built ${entries.length} entries from cvdict`)

// ─── Step 3: Simp/trad pass ──────────────────────────────────────────────────

console.log('\n[3/3] Resolving simp/trad relationships...')

// Build: trad → simp map from existing entries (entries with t field are simp)
const tradToSimp = new Map()
for (const e of entries) {
  if (e.t) tradToSimp.set(e.t, e.s)
}

let flagged = 0
let synthCreated = 0
let alreadyPresent = 0

// Pass A: mark existing entries + create missing counterparts
const synthetic = []

for (const e of entries) {
  const lex = getEntries(e.s)?.[0]
  const lexTrad = lex?.trad

  if (lexTrad && lexTrad !== e.s) {
    // e.s is simplified, lexTrad is traditional
    e.hasTrad = lexTrad

    if (byChar.has(lexTrad)) {
      // trad already in dict — mark it
      const tradEntry = byChar.get(lexTrad)
      if (!tradEntry.hasSimp) {
        tradEntry.hasSimp = e.s
        flagged++
      }
      alreadyPresent++
    } else {
      // trad missing — create synthetic entry
      const tradLex = getEntries(lexTrad)?.[0]
      const sv = kVietRaw[lexTrad]?.[0] ?? e.sv
      const rec = buildRecord(lexTrad, tradLex, sv)
      rec.hasSimp = e.s
      synthetic.push(rec)
      byChar.set(lexTrad, rec)
      synthCreated++
    }
    flagged++
  } else {
    // e.s is traditional (or no simp variant)
    // use lex.simp to find simplified form
    const lexSimp = lex?.simp
    const simpChar = tradToSimp.get(e.s) ?? (lexSimp && lexSimp !== e.s ? lexSimp : undefined)
    if (simpChar) {
      e.hasSimp = simpChar
      flagged++
      if (!byChar.has(simpChar)) {
        // simp not in dict (not in kVietnamese) — create synthetic entry
        const simpLex = getEntries(simpChar)?.[0]
        const sv = kVietRaw[simpChar]?.[0] ?? e.sv
        const rec = buildRecord(simpChar, simpLex, sv)
        rec.hasTrad = e.s
        synthetic.push(rec)
        byChar.set(simpChar, rec)
        synthCreated++
      }
    }
  }
}

// Pass B: mark synthetic trad entries' simp counterparts as hasTrad
for (const e of entries) {
  if (e.hasTrad) {
    const tradEntry = byChar.get(e.hasTrad)
    if (tradEntry && !tradEntry.hasSimp) {
      tradEntry.hasSimp = e.s
    }
  }
}

const allEntries = [...entries, ...synthetic]

// Stats
const withHasTrad = allEntries.filter(e => e.hasTrad).length
const withHasSimp = allEntries.filter(e => e.hasSimp).length
const synthTrad = synthetic.length

console.log(`  Entries with hasTrad:        ${withHasTrad}`)
console.log(`  Entries with hasSimp:        ${withHasSimp}`)
console.log(`  Counterpart already in dict:   ${alreadyPresent}`)
console.log(`  Synthetic entries added:       ${synthCreated}`)
console.log(`  Total entries:                 ${allEntries.length}`)

// ─── Write output ────────────────────────────────────────────────────────────

const outPath = join(OUT_DIR, 'dictionary.json')
await mkdir(OUT_DIR, { recursive: true })
await writeFile(outPath, JSON.stringify(allEntries))
const { size } = await stat(outPath)
const kb = (size / 1024).toFixed(1)
console.log(`\n✓ Written → public/data/dictionary.json`)
console.log(`  Entries: ${allEntries.length} | Size: ${kb} KB\n`)
