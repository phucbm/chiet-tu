# Chiết Tự — Architecture

## Layout

Mobile-first, max-width 600px, centered on desktop.

```
body (bg: #ECEAE6, full viewport)
  └─ outer wrapper (min-h-dvh flex justify-center)
       └─ inner wrapper (w-full max-w-[600px] h-dvh flex flex-col relative bg-[#F8F7F5] overflow-hidden)
            └─ BottomSheetProvider
                 └─ page content (flex-1 flex flex-col)
```

**BottomSheet uses `absolute` positioning** — constrained to the 600px container, NOT `fixed`. Never change this.

---

## Screens

### Screen 1 — Home (`/`)
```
[Header: "Chiết Tự" + tagline]
[Scrollable body]
  [My Characters] — visible only if localChars.length > 0
    [CharCard × N — onClick opens Edit Sheet]
  [Curated Characters]
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
  [StrokeBox]
  [Translation vi]
  [Etymology note]
  [Components repeater]
  [Examples]
  [Related words]
  [Radical + contributor]
[ToolBar]
  Left: Edit (always) — clone prompt if no local copy
  Right: Contribute (only if local copy exists)
```

---

## Data Structure

```ts
interface CharEntry {
  char: string              // Han character (simp or trad)
  trad?: string             // legacy traditional field
  hasTrad?: string          // entry is simplified; value = traditional counterpart
  hasSimp?: string          // entry is traditional; value = simplified counterpart
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
  // runtime-only — stripped before GitHub PR
  source?: 'repo' | 'local'
  copiedFrom?: string
  createdAt?: number
  updatedAt?: number
}
```

---

## Files Map

```
app/
  layout.tsx              — root layout, BottomSheetProvider
  page.tsx                — server component, loads repo chars
  HomeClient.tsx          — home screen client
  char/
    page.tsx              — /char?c= (external/gen chars)
    [char]/
      page.tsx            — /char/[char] (repo chars)
      CharPageClient.tsx  — char detail screen

components/
  CharCard.tsx
  StrokeBox.tsx
  search/SearchSheet.tsx  — see search.md
  sheets/EditSheet.tsx
  contribute/ContributeSheet.tsx  — see contribution.md
  shell/
    BottomSheet.tsx       — MUST stay absolute, not fixed
    ToolBar.tsx
    AppFooter.tsx

lib/
  types.ts                — CharEntry, EtymologyComponent, ExternalChar, SearchResult
  client-dictionary.ts    — browser-side search (searchChars)
  chars.ts                — server-side char loading (injects source: 'repo')
  github.ts               — GitHub PR creation
  utils.ts                — cn(), charChangeSummary()

store/
  useCharStore.ts         — local chars, Zustand + persist

scripts/
  build-dictionary.mjs    — builds public/data/dictionary.json
  build-index.mjs         — builds public/chars/index.json (runs prebuild/predev)

chars/                    — curated JSON files, community PRs only
data/
  kVietnamese.json        — Unihan kVietnamese source
  cvdict.json             — Vietnamese definitions
public/
  data/dictionary.json    — built dict (4000+ entries + simp/trad synthetics)
  chars/index.json        — built curated index
```

---

## Data Sources

| Source | File | Server | Browser |
|---|---|---|---|
| `chinese-lexicon` npm | (bundled) | ✓ | ✗ (Node `fs`) |
| `cvdict.json` | `data/` + `public/data/` | ✓ | ✓ |
| `kVietnamese.json` | `data/` + `public/data/` | ✓ | ✓ |
| `chars/*.json` | `public/chars/index.json` | ✓ | ✓ |

`lib/lexicon.ts` is server-only. Priority: `localChar` > `curated` > `lexicon`.

---

## See Also
- [search.md](search.md) — search logic, dictionary build, simp/trad
- [contribution.md](contribution.md) — clone/edit/contribute flow, char types
