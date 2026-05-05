"use client"

import { motion, AnimatePresence } from 'framer-motion'
import type { ControlButton } from './controls'

function ToolBarButton({ btn }: { btn: ControlButton }) {
  return (
    <motion.button
      layout
      onClick={btn.onClick}
      aria-label={btn.label}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative flex flex-col items-center justify-center gap-1 w-12 h-12 active:scale-90 text-[#0F0F0F]"
    >
      {btn.icon}
    </motion.button>
  )
}

function ToolBarGroup({ buttons }: { buttons: ControlButton[] }) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-center h-12 px-1 gap-0.5 rounded-full border border-white shadow-xl backdrop-blur bg-white/50"
    >
      <AnimatePresence mode="popLayout">
        {buttons.map(btn => (
          <ToolBarButton key={btn.label} btn={btn} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

interface ToolBarProps {
  buttons: ControlButton[]
  visible?: boolean
}

export function ToolBar({ buttons, visible = true }: ToolBarProps) {
  const left = buttons.filter(b => b.position === 'left')
  const right = buttons.filter(b => b.position === 'right')

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="absolute bottom-0 inset-x-0 flex items-end justify-between px-5 pb-6 z-20"
    >
      <div>{left.length > 0 ? <ToolBarGroup buttons={left} /> : <div className="w-12" />}</div>
      <div>{right.length > 0 ? <ToolBarGroup buttons={right} /> : null}</div>
    </motion.div>
  )
}
