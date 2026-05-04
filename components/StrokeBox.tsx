"use client"

import { useEffect, useRef } from 'react'

interface Props {
  char: string
  width?: number
  height?: number
}

declare global {
  interface Window {
    HanziWriter: {
      create: (
        el: HTMLElement,
        char: string,
        options: Record<string, unknown>
      ) => { animateCharacter: () => void }
    }
  }
}

export function StrokeBox({ char, width = 200, height = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<ReturnType<typeof window.HanziWriter.create> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function init() {
      if (!el || !window.HanziWriter) return
      el.innerHTML = ''
      writerRef.current = window.HanziWriter.create(el, char, {
        width,
        height,
        padding: 5,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
      })
      writerRef.current.animateCharacter()
    }

    if (window.HanziWriter) {
      init()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'
    script.onload = init
    document.head.appendChild(script)
  }, [char, width, height])

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="rounded-xl border border-[#E0E0DC] bg-white"
    />
  )
}
