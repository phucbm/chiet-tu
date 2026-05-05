"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface HeaderSlotContextValue {
  content: ReactNode
  setContent: (c: ReactNode) => void
}

const HeaderSlotContext = createContext<HeaderSlotContextValue>({
  content: null,
  setContent: () => {},
})

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)
  return (
    <HeaderSlotContext.Provider value={{ content, setContent }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}

export function HeaderSlotRenderer() {
  const { content } = useContext(HeaderSlotContext)
  return <>{content}</>
}

export function useHeaderSlot(content: ReactNode) {
  const { setContent } = useContext(HeaderSlotContext)
  useEffect(() => {
    setContent(content)
    return () => setContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
