# Data Source Refactor

## Final Data Sources

| Source | Side | How | Notes |
|---|---|---|---|
| `public/data/dictionary.json` | Client | fetch once, in-memory cache | Built from chinese-lexicon + kVietnamese + cvdict + sinoViet-overrides. Committed to repo. Updated manually when sources change (rare). |
| `public/chars/index.json` | Client | fetch once, in-memory cache | Built from `chars/*.json`. Rebuilt by GitHub Action on every push that touches `chars/`. |
| `hanzi-writer` CDN | Client | script tag | Stroke animation. Unchanged. |
| `hanzi-writer-data` CDN | Client | per-char fetch | Stroke count lookup. Unchanged. |
| `localStorage` (Zustand) | Client | persisted store | Local drafts. Unchanged. |
| GitHub API (Octokit) | Client | GitHub App, direct from browser | Same pattern as clyrics. Private key in env var, scoped to one repo, all submissions go through PRs for review. |

**Removed:** `lib/chars.ts`, `lib/lexicon.ts`, `raw.githubusercontent.com` fetch, server-only data imports.

**Kept:** `pinyin-pro` as runtime dep — used in `EditSheet` for pinyin auto-fill on custom char components/notes.

## Search & Display Rules

- **Search:** deduplicate across both sources — unique chars only. Same char in both → show once (curated preferred).
- **Char detail:** prefer curated (`chars/index.json`) when available, fall back to dictionary.
- **Source info:** keep both sources accessible separately in `lib/client-dictionary.ts` — UI may expose source toggle later.

## `lib/client-dictionary.ts` API

```ts
searchChars(query: string): SearchResult[]   // unique results, curated preferred
getChar(char: string): CharEntry | null       // curated first, dict fallback
getCurated(): CharEntry[]                    // raw curated index
getDictionary(): DictEntry[]                 // raw dictionary entries
```

## Steps

1. **`scripts/build-dictionary.ts`** — merge chinese-lexicon + kVietnamese + cvdict + sinoViet-overrides → `public/data/dictionary.json`. Single chars only. Compact fields: `s`, `t`, `p`, `pt`, `sp`, `sv`, `vi`, `en`, `etym_note`, `etym_components`, `related`.
2. **Run locally, commit `public/data/dictionary.json`** — one-time artifact.
3. **Update `scripts/build-index.mjs`** — drop kVietnamese.json copy (no longer needed in public/data/).
4. **Write `lib/client-dictionary.ts`** — fetch both files separately, cache in-memory, expose API above.
5. **Update char page** — `app/char/[char]/page.tsx` + `CharPageClient.tsx` → remove server `getChar`/`getLexiconData`, use client dictionary.
6. **Update search** — `SearchSheet`/`SearchDialog` → use `searchChars()` from client dictionary.
7. **Move GitHub to client** — `lib/github.ts` already works client-side (NEXT_PUBLIC_ env vars). Call directly from `ContributeSheet`, remove server-only assumptions.
8. **Delete dead code** — `lib/chars.ts`, `lib/lexicon.ts`.
9. **GitHub Action** — on push to `main` when `chars/**` changes → run `build-index.mjs` → commit updated `public/chars/index.json`.
