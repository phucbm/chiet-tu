"use client"

import {motion} from 'framer-motion'
import type {ControlButton} from './controls'
import {cn} from "@/lib/utils";

function ToolBarButton({ btn }: { btn: ControlButton }) {
  return (
    <button
      onClick={btn.onClick}
      aria-label={btn.label}
      className="relative flex flex-col items-center justify-center gap-1 w-12 h-12 active:scale-90 text-[#0F0F0F]"
    >
      {btn.icon}
    </button>
  )
}

function ToolBarGroup({ buttons, position }: { buttons: ControlButton[], position: 'left' | 'right' }) {
  const visible = buttons.length > 0
  return (
    <motion.div
      initial={false}
      animate={visible ? { x: 0, opacity: 1 } : { x: position === 'left' ? '-200%' : '200%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className={cn(
        "toolbar-wrapper flex items-center h-12 gap-0.5 rounded-full border border-white shadow-xl backdrop-blur bg-white/50",
        buttons.length > 1 ? "px-2" : ""
      )}
    >
      {buttons.map(btn => (
        <ToolBarButton key={btn.label} btn={btn} />
      ))}
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
      <ToolBarGroup buttons={left} position="left" />
      <ToolBarGroup buttons={right} position="right" />
    </motion.div>
  )
}
