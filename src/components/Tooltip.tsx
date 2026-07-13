'use client'

import { useState, useRef } from 'react'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setShow(true)
      }}
      onMouseLeave={() => {
        timeoutRef.current = window.setTimeout(() => setShow(false), 100)
      }}
    >
      {children}
      {show && (
        <div className={`absolute z-50 ${sideClasses[side]}`}>
          <div className="px-2 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium whitespace-nowrap shadow-lg animate-dropdownIn">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
