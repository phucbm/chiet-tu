# Chiết Tự — Architecture

## Layout

Mobile-first, max-width 600px, centered on desktop (same pattern as clyrics).

```
body (bg: #ECEAE6, full viewport)
  └─ outer wrapper (min-h-dvh flex justify-center)
       └─ inner wrapper (w-full max-w-[600px] h-dvh flex flex-col relative bg-[#F8F7F5] overflow-hidden)
            └─ BottomSheetProvider
                 └─ page content (flex-1 flex flex-col)
```

**BottomSheet uses `absolute` positioning** — constrained to the 600px container, NOT `fixed`. This is intentional so the sheet never escapes the viewport container on desktop.

---

## Char Types

| Type | `source` | Storage | Description |
|---|---|---|---|
| **char-repo** | `'repo'` | GitHub `chars/` folder | Curated, contributed via PR |
| **char-gen** | — | Runtime only (`ExternalChar`) | Synthesized from Unihan kVietnamese. No repo entry. |
| **char-local** | `'local'` | Device via `useCharStore` (localStorage/Zustand) | Cloned copy of repo or gen char. `copiedFrom` tracks origin. |

`source` is NOT stored in repo JSON files — injected at load time. Runtime-only fields (`source`, `copiedFrom`, `createdAt`, `updatedAt`) are stripped before creating GitHub PRs.

---

## Data Structure

```ts
interface CharEntry {
  char: string              // simplified Han
  trad?: string             // traditional form
  pinyin: string            // LOCAL: Unihan kMandarin
  sino_vietnamese: string   // LOCAL: Unihan kVietnamese (primary reading)
  strokes?: number          // LOCAL: Unihan kTotalStrokes
  radical?: string          // LOCAL: Unihan kRSKangXi
  translation: { vi: string }  // LLM (later)
  etymology: {
    note: string               // long explanation — LLM (later)
    components: EtymologyComponent[]  // LOCAL: makemeahanzi decomposition
    examples: string[]         // LLM (later)
    related: string[]          // LLM (later)
  }
  tags: string[]
  contributor?: string
  sources: string[]
  // runtime-only
  source?: 'repo' | 'local'
  copiedFrom?: string
  createdAt?: number
  updatedAt?: number
}

interface EtymologyComponent {
  char: string
  componentName: string    // e.g. "ý nghĩa", "âm thanh"
  pinyin: string           // LOCAL: Unihan lookup
  sino_vietnamese: string  // LOCAL: Unihan lookup
  translation: string      // LLM (later)
}
```

### Local data available now (no LLM needed)
- `char`, `trad` → Unihan kTraditionalVariant
- `pinyin` → Unihan kMandarin
- `sino_vietnamese` → Unihan kVietnamese ✓ (already in `data/kVietnamese.json`)
- `strokes`, `radical` → Unihan ✓ (already in char JSON files)
- `etymology.components[].char` → makemeahanzi decomposition (not yet integrated)
- `etymology.components[].pinyin/sino_vietnamese` → Unihan per component char

---

## Screens

### Screen 1 — Home (`/`)
```
[Header: "Chiết Tự" + tagline]
[Scrollable body]
  [My Characters section] — visible only if localChars.length > 0
    [CharCard × N — onClick opens Edit Sheet directly]
  [Curated Characters section]
    [CharCard × N — Link to /char/[char]]
  [AppFooter]
[ToolBar: Search (right)]
```

### Screen 2 — Char Detail (`/char/[char]` and `/char?c=`)
```
[Header: back + "Chiết Tự"]
[Scrollable body]
  [Hero: char | trad | pinyin | sino-vietnamese | strokes]
  [Source badges: external / local]
  [StrokeBox (stroke animation)]
  [Translation section — vi]
  [Etymology note]
  [Components repeater]
  [Examples]
  [Related words]
  [Radical + contributor]
[ToolBar]
  Left: Edit button (always shown)
    - char-local exists → opens Edit Sheet
    - no local clone → opens Clone Prompt sheet
  Right: Contribute button (only if local clone exists)
```

---

## Sheets

All sheets use the custom `BottomSheet` component (absolute-positioned, constrained to 600px container).

### Search Sheet
- Trigger: toolbar Search button (Home + Char pages)
- `useSearchSheet()` hook returns opener function
- Content: mode tabs (text / draw) + input + results list
- On result select: navigate + `closeAll()`

### Clone Prompt (inline in Edit Sheet flow)
- Shown when Edit is tapped on char-repo or char-gen
- Message: "Lưu về thiết bị để chỉnh sửa"
- "Lưu về thiết bị" button → `cloneFromRepo()` or `cloneFromGen()` → opens Edit Sheet

### Edit Sheet
- Only for char-local
- Fields: trad, pinyin, sino_vietnamese, strokes, radical, translation.vi, etymology.note, components (repeater), examples, related
- Footer: "Lưu" button
- Top actions: "Khôi phục bản gốc" (if `copiedFrom` points to repo char)
- Delete link at bottom

### Contribute Sheet
- Only for char-local
- Diff detection via `charChangeSummary()` — compares local vs `repoOriginal`
- Mode selector:
  - "Chữ mới" (always available)
  - "Đề xuất chỉnh sửa" (only if `copiedFrom` is a repo char)
- Identical detection → disabled state
- Nickname input (persisted to localStorage as `chiettu_nickname`)
- PR title preview
- Submits via `contributeChar()` → creates GitHub PR

---

## State

### `useCharStore` (Zustand + persist → `chiettu_chars`)
Stores only `source: 'local'` chars. Repo and gen chars are fetched at runtime.

Key methods:
- `cloneFromRepo(entry)` — copies CharEntry, sets `source: 'local'`, `copiedFrom: entry.char`
- `cloneFromGen(entry)` — creates CharEntry from ExternalChar skeleton, `copiedFrom: 'gen:{char}'`
- `findLocal(char)` — find local clone by char string
- `updateChar(char, updates)` — update + set `updatedAt`
- `deleteChar(char, localId)` — remove by `createdAt` timestamp (unique ID)

---

## Files Map

```
app/
  layout.tsx              — root layout, max-width wrapper, BottomSheetProvider
  page.tsx                — server component, loads repo chars
  HomeClient.tsx          — home screen client
  char/
    page.tsx              — /char?c= route (external/gen chars)
    [char]/
      page.tsx            — /char/[char] route (repo chars)
      CharPageClient.tsx  — char detail screen

components/
  CharCard.tsx            — card with optional onClick (Link vs button)
  StrokeBox.tsx           — stroke animation
  search/
    SearchSheet.tsx       — search UI + useSearchSheet() hook
  sheets/
    EditSheet.tsx         — edit local char
  contribute/
    ContributeSheet.tsx   — contribute to repo via PR
  shell/
    BottomSheet.tsx       — absolute-positioned sheet (MUST stay absolute, not fixed)
    ToolBar.tsx           — floating toolbar
    AppFooter.tsx

lib/
  types.ts                — CharEntry, EtymologyComponent, ExternalChar, SearchResult
  chars.ts                — server-side char loading (injects source: 'repo')
  github.ts               — GitHub PR creation (strips runtime fields before commit)
  utils.ts                — cn(), charChangeSummary()

store/
  useCharStore.ts         — local chars, Zustand + persist

chars/                    — source JSON files (one per char)
public/chars/index.json   — built by scripts/build-index.mjs
data/kVietnamese.json     — Unihan kVietnamese source
```

---

## Local Data Sources (no LLM)

| Source | File | Server | Browser |
|---|---|---|---|
| `chinese-lexicon` npm | (bundled) | ✓ | ✗ (uses Node `fs`) |
| `cvdict.json` | `data/cvdict.json` / `public/data/cvdict.json` | ✓ | ✓ (static fetch) |
| `kVietnamese.json` | `data/kVietnamese.json` / `public/data/kVietnamese.json` | ✓ | ✓ (static fetch) |
| `sinoViet-overrides.json` | `data/sinoViet-overrides.json` | ✓ | ✗ |
| `chars/*.json` | `public/chars/index.json` | ✓ | ✓ (static fetch) |

`lib/lexicon.ts` is **server-only** (`import 'server-only'`). Uses `chinese-lexicon` + cvdict + kVietnamese + overrides.
Priority for display: `localChar` > `curated` > `lexicon`.

### Data available per page type

| Field | `[char]` server page | `?c=` client page |
|---|---|---|
| sino_vietnamese | ✓ lexicon | ✓ kVietnamese fetch |
| translation_vi | ✓ cvdict | ✓ cvdict fetch |
| trad | ✓ lexicon | ✓ cvdict fetch |
| pinyin | ✓ lexicon | ✗ |
| etymology note | ✓ chinese-lexicon | ✗ |
| components | ✓ chinese-lexicon | ✗ |
| related words | ✓ chinese-lexicon | ✗ |

External chars (`?c=`) get trad + translation from cvdict browser fetch. Full etymology only available after cloning to local (user edits) or when char has a curated entry.

## Future: LLM Integration (not yet)
Fields to generate via LLM when implemented:
- `translation.vi` (brief meaning in Vietnamese)
- `etymology.note` (long explanation)
- `etymology.components[].translation`
- `etymology.examples`
- `etymology.related`
