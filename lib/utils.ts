import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CharEntry } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CharChangeSummary {
  changedFields: number
  fieldNames: string[]
}

export function charChangeSummary(local: CharEntry, original: CharEntry): CharChangeSummary {
  const changed: string[] = []

  if (local.pinyin !== original.pinyin) changed.push('pinyin')
  if (local.sino_vietnamese !== original.sino_vietnamese) changed.push('Hán Việt')
  if ((local.trad ?? '') !== (original.trad ?? '')) changed.push('phồn thể')
  if ((local.strokes ?? 0) !== (original.strokes ?? 0)) changed.push('số nét')
  if ((local.radical ?? '') !== (original.radical ?? '')) changed.push('bộ thủ')
  if (local.translation.vi !== original.translation.vi) changed.push('nghĩa')
  if (local.etymology.note !== original.etymology.note) changed.push('chú thích')
  if (local.etymology.components.length !== original.etymology.components.length) {
    changed.push('thành phần')
  } else {
    const diff = local.etymology.components.some((c, i) => {
      const o = original.etymology.components[i]
      return c.char !== o.char || c.translation !== o.translation || c.componentName !== o.componentName
    })
    if (diff) changed.push('thành phần')
  }
  if (JSON.stringify(local.etymology.examples) !== JSON.stringify(original.etymology.examples))
    changed.push('ví dụ')
  if (JSON.stringify(local.etymology.related) !== JSON.stringify(original.etymology.related))
    changed.push('từ liên quan')

  return { changedFields: changed.length, fieldNames: changed }
}
