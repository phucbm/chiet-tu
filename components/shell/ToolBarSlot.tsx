"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ToolBar } from './ToolBar'
import type { ControlButton } from './controls'

interface ToolBarSlotContextValue {
  pageButtons: ControlButton[]
  globalButtons: ControlButton[]
  setPageButtons: (b: ControlButton[]) => void
  setGlobalButtons: (b: ControlButton[]) => void
}

const ToolBarSlotContext = createContext<ToolBarSlotContextValue>({
  pageButtons: [],
  globalButtons: [],
  setPageButtons: () => {},
  setGlobalButtons: () => {},
})

export function ToolBarSlotProvider({ children }: { children: ReactNode }) {
  const [pageButtons, setPageButtons] = useState<ControlButton[]>([])
  const [globalButtons, setGlobalButtons] = useState<ControlButton[]>([])
  return (
    <ToolBarSlotContext.Provider value={{ pageButtons, globalButtons, setPageButtons, setGlobalButtons }}>
      {children}
      <ToolBar buttons={[...pageButtons, ...globalButtons]} />
    </ToolBarSlotContext.Provider>
  )
}

export function useToolBarSlot(buttons: ControlButton[]) {
  const { setPageButtons } = useContext(ToolBarSlotContext)
  useEffect(() => {
    setPageButtons(buttons)
    return () => setPageButtons([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useGlobalToolBarSlot(buttons: ControlButton[]) {
  const { setGlobalButtons } = useContext(ToolBarSlotContext)
  useEffect(() => {
    setGlobalButtons(buttons)
    return () => setGlobalButtons([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
