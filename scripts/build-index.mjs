import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises'
import { join } from 'path'

const CHARS_DIR = join(process.cwd(), 'chars')
const OUT_DIR = join(process.cwd(), 'public', 'chars')
const DATA_OUT_DIR = join(process.cwd(), 'public', 'data')

const files = await readdir(CHARS_DIR).catch(() => [])
const entries = []

for (const file of files) {
  if (!file.endsWith('.json')) continue
  try {
    const raw = await readFile(join(CHARS_DIR, file), 'utf-8')
    entries.push(JSON.parse(raw))
  } catch {
    console.warn(`skip ${file}`)
  }
}

await mkdir(OUT_DIR, { recursive: true })
await mkdir(DATA_OUT_DIR, { recursive: true })
await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify(entries, null, 2))
await copyFile(
  join(process.cwd(), 'data', 'kVietnamese.json'),
  join(DATA_OUT_DIR, 'kVietnamese.json')
)
console.log(`built index: ${entries.length} entries → public/chars/index.json`)
console.log('copied kVietnamese.json → public/data/kVietnamese.json')
