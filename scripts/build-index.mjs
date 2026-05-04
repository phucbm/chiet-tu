import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, basename } from 'path'

const CHARS_DIR = join(process.cwd(), 'chars')
const OUT_DIR = join(process.cwd(), 'public', 'chars')
const OUT_FILE = join(OUT_DIR, 'index.json')

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
await writeFile(OUT_FILE, JSON.stringify(entries, null, 2))
console.log(`built index: ${entries.length} entries → public/chars/index.json`)
