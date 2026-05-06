# Search

## Entry point
- `components/search/SearchSheet.tsx` — UI + `useSearchSheet()` hook
- `lib/client-dictionary.ts` — `searchChars(query)` — client-side search logic

## Trigger
- Toolbar Search button (Home + Char pages)
- Keyboard shortcut via `SearchShortcut` component (`lib/keys.ts`)

## Modes
| Mode | Description |
|---|---|
| `text` | Type to search |
| `draw` | Handwriting via `HanziInput` |

## Search logic (`searchChars`)
Searches curated entries first, then dictionary. A query matches if:
- **Chinese char** — `entry.char` contains query
- **Pinyin** — tone-stripped syllable match (`matchesPinyin`)
- **Sino-Vietnamese** — exact/prefix match OR tone-stripped match (`matchesSV`)

Both `matchesPinyin` and `matchesSV` use `stripTones()` which normalizes NFD and strips diacritics — so "nguyen" matches "nguyên", "lac" matches "lạc".

## Dictionary entries (`public/data/dictionary.json`)
Built by `scripts/build-dictionary.mjs`. Each entry shape (compact):
```ts
{
  s: string        // the char
  p?: string       // pinyin
  sv?: string      // sino-vietnamese
  t?: string       // traditional form (legacy)
  hasTrad?: string // this char is simplified; value = trad counterpart
  hasSimp?: string // this char is traditional; value = simp counterpart
  en?: string[]    // English definitions
  vi?: string      // Vietnamese definition (cvdict)
  note?: string    // etymology note
  comps?: { c, n, p, sv, t }[]  // components
  related?: string[] // topWords (vocabulary collocations, NOT simp/trad)
}
```

### Build steps
1. `kVietnamese.json` drives char set — only chars with SV get entries
2. `chinese-lexicon` + `cvdict` enrich (pinyin, defs, etymology)
3. Simp/trad pass: resolve counterparts via `lex.trad`/`lex.simp`; create synthetic entries for missing counterparts; synthetic entries inherit sv/p/en

### simp/trad flags
- `hasTrad` present → entry is simplified form
- `hasSimp` present → entry is traditional form
- Synthetic entries (not in kVietnamese) are created so both forms always appear in search results

## Result type
```ts
type SearchResult = { type: 'curated'; entry: CharEntry }
```
On select → `router.push('/char/' + encodeURIComponent(char))` + `closeAll()`
