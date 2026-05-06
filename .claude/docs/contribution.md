# Contribution Flow

## Char types
| Type | `source` | Storage | Description |
|---|---|---|---|
| **char-repo** | `'repo'` | GitHub `chars/` folder | Curated, contributed via PR |
| **char-gen** | — | Runtime only (`ExternalChar`) | Synthesized from kVietnamese. No repo entry. |
| **char-local** | `'local'` | Device via `useCharStore` (Zustand persist) | Cloned copy of repo or gen char. `copiedFrom` tracks origin. |

`source` is NOT stored in repo JSON files — injected at runtime. Fields `source`, `copiedFrom`, `createdAt`, `updatedAt` are stripped before GitHub PR.

## Chars folder
- `chars/` — source JSON files, one per char (e.g. `chars/中.json`)
- Populated by **community PRs only** — never scripted or bulk-added
- `public/chars/index.json` — built by `scripts/build-index.mjs` (runs as `prebuild`/`predev`)

## Clone flow
1. User taps Edit on a char-repo or char-gen entry
2. Clone Prompt sheet shown: "Lưu về thiết bị để chỉnh sửa"
3. "Lưu về thiết bị" → `cloneFromRepo()` or `cloneFromGen()` → opens Edit Sheet

## Edit Sheet (`components/sheets/EditSheet.tsx`)
- Only for `source: 'local'`
- Fields: trad, pinyin, sino_vietnamese, strokes, radical, translation.vi, etymology.note, components (repeater), examples, related
- Footer: "Lưu" saves to `useCharStore`
- Top: "Khôi phục bản gốc" (only if `copiedFrom` points to repo char)
- Bottom: Delete link

## Contribute Sheet (`components/contribute/ContributeSheet.tsx`)
- Only for `source: 'local'`
- Diff via `charChangeSummary()` — compares local vs `repoOriginal`
- Modes:
  - "Chữ mới" — always available
  - "Đề xuất chỉnh sửa" — only if `copiedFrom` is a repo char
- Identical detection → disabled submit
- Nickname input → persisted to localStorage as `chiettu_nickname`
- Submits via `contributeChar()` (`lib/github.ts`) → creates GitHub PR

## State (`store/useCharStore.ts`)
Zustand + persist → key `chiettu_chars`. Stores only `source: 'local'` chars.

Key methods:
- `cloneFromRepo(entry)` — copies CharEntry, sets `source: 'local'`, `copiedFrom: entry.char`
- `cloneFromGen(entry)` — creates skeleton from ExternalChar, `copiedFrom: 'gen:{char}'`
- `findLocal(char)` — find local clone by char string
- `updateChar(char, updates)` — update + set `updatedAt`
- `deleteChar(char, localId)` — remove by `createdAt` timestamp (unique ID)
