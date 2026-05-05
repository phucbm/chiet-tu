# chiettu — Build Plan

Open-source encyclopedia of Chinese character etymology (chiết tự). Curated, community-contributed, SEO-first. Not a dictionary. The physical chiết tự book digitized and expanded by community.

---

## Stack

- **Next.js 16 static export** (`output: 'export'`)
- **Tailwind v4** + minimal shadcn components
- **Serwist** PWA
- **GROQ** for AI explanations (optional, server env, disabled if key absent)
- **hanzi-writer** via CDN for stroke animation
- **No auth, no server DB, no Turso, no Clerk**

---

## Data Model — `chars/中.json`

```json
{
  "char": "中",
  "pinyin": "zhōng",
  "sino_vietnamese": "trung",
  "strokes": 4,
  "radical": "丨",
  "components": ["口", "丨"],
  "etymology": {
    "vi": "Hình ảnh cây cọc cắm giữa vòng tròn, nghĩa gốc là 'ở giữa'.",
    "en": "Pictograph of a pole through the center of a target."
  },
  "notes": "",
  "tags": ["hsk1", "common"],
  "contributor": "phucbm",
  "sources": ["chiettu-book", "outlier-linguistics"]
}
```

---

## Repo Structure

```
chiet-tu/
├── chars/                    ← github-as-db, one JSON per char, committed
│   ├── 中.json
│   ├── 人.json
│   └── ...
├── scripts/
│   └── build-index.mjs       ← reads chars/, writes public/chars/index.json
├── public/
│   └── chars/
│       └── index.json        ← gitignored, generated at build time
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          ← browse + search curated chars
│   │   ├── [char]/
│   │   │   └── page.tsx      ← static SEO page per char
│   │   ├── contribute/
│   │   │   └── page.tsx      ← how to contribute via GitHub PR
│   │   └── about/
│   │       └── page.tsx
│   ├── components/
│   │   ├── CharCard.tsx      ← compact char display for browse grid
│   │   ├── StrokeBox.tsx     ← hanzi-writer stroke animation (port from hieu-chu-han)
│   │   ├── EtymologySection.tsx
│   │   ├── ComponentTree.tsx ← visual breakdown: 明 = 日 + 月
│   │   └── AIExplanation.tsx ← GROQ lazy-load, client component
│   ├── data/
│   │   └── kVietnamese.json  ← port from hieu-chu-han
│   └── lib/
│       ├── chars.ts          ← readCharIndex(), getChar()
│       └── groq.ts           ← stream AI explanation
├── next.config.ts
└── package.json
```

---

## Build Pipeline

```
prebuild → node scripts/build-index.mjs   (reads chars/ → public/chars/index.json)
build    → next build                      (generateStaticParams reads index.json → one HTML per char)
```

Scripts in `package.json`:
```json
{
  "prebuild": "node scripts/build-index.mjs",
  "predev": "node scripts/build-index.mjs",
  "build": "next build",
  "dev": "next dev"
}
```

---

## Pages

| Route | Type | Content |
|---|---|---|
| `/` | Static | Browse grid of curated chars, search |
| `/[char]` | Static (SSG) | Full etymology page |
| `/contribute` | Static | PR guide, JSON schema reference |
| `/about` | Static | Purpose, book origin, open-source |

---

## Per-Char Page Content

1. Large character display
2. Stroke order animation (hanzi-writer CDN)
3. Pinyin + Sino-Vietnamese reading
4. Etymology story — VI primary, EN secondary
5. Component breakdown visual tree (e.g. 明 = 日 + 月)
6. Radical info
7. AI-generated extended explanation (GROQ, lazy client-load)
8. Sources cited
9. "Đóng góp / Edit this page" → link to GitHub edit URL

---

## What to Port from hieu-chu-han

| Asset | Source path | Action |
|---|---|---|
| Sino-Viet readings | `src/data/kVietnamese.json` | Copy directly |
| Stroke animation | `src/components/word/StrokeBox.tsx` | Copy, minor cleanup |
| Etymology display | `src/components/word/EtymologySection.tsx` | Adapt |
| GROQ streaming | `src/lib/groq.ts` | Copy, new prompt |
| Compound segmenter | `src/core/segmenter.ts` | Copy if needed |
| Build script base | `scripts/build-dictionary.ts` | Extract etymology fields only |

---

## Seed Data Plan (Phase 1)

1. Manually transcribe physical chiết tự book → JSON files (phucbm as first contributor)
2. Script to pre-fill `components` + `radical` from `chinese-lexicon` outlier data
3. Pre-fill `sino_vietnamese` from `kVietnamese.json`
4. Leave `etymology.vi` empty until human-curated — no auto-generated content in chars/

---

## AI Integration

- Client component lazy-loads on char page: `GET /api/ai/explain?char=中`
- GROQ streams VI + EN explanation in one call
- Not baked into static HTML (runtime only, not SEO content)
- After human review, explanation can be saved back to `chars/中.json` via PR
- Disabled gracefully if `GROQ_API_KEY` absent

---

## Community Contribution Model

- User forks repo
- Adds or edits `chars/中.json`
- Submits PR with description
- Merged → char appears on next deploy (Vercel auto-deploy on push)
- GitHub Actions: validate JSON schema on every PR

PR template fields: char, pinyin, sino_vietnamese, etymology.vi, sources, contributor name

---

## Explicitly Out of Scope

- Handwriting recognition
- Full dictionary / competing with dict apps
- User accounts, notebook, saved words
- Flashcard / SRS study
- Mass auto-generated pages for all 116K chars
- Lyrics (that is clyrics)
- Any feature requiring server runtime

---

## Phases

### Phase 1 — Foundation
- [ ] Repo init: Next.js 15 static export + Tailwind v4 + Serwist
- [ ] `chars/` folder + `build-index.mjs` script
- [ ] Index page: browse curated chars grid
- [ ] `[char]` static page: stroke + etymology + components
- [ ] Deploy to Vercel

### Phase 2 — Content Seed
- [ ] Transcribe physical chiết tự book → JSON files
- [ ] Script: pre-fill fields from chinese-lexicon + kVietnamese
- [ ] GROQ AI explanation lazy-load on char page

### Phase 3 — Community
- [ ] `/contribute` guide page
- [ ] PR template for adding chars
- [ ] GitHub Actions: JSON schema validation on PR

### Phase 4 — SEO Polish
- [ ] OG image per char (satori)
- [ ] Sitemap generation at build time
- [ ] JSON-LD structured data per char page
- [ ] robots.txt

---

## Deploy

Cloudflare Pages static. `output: 'export'`. Auto-deploy on merge to main.
Zero server cost. Zero infra to manage.

