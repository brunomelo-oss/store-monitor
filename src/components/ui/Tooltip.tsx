'use client'

import { useState, type ReactNode } from 'react'

export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' }) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className={`absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2 py-1 rounded-md text-xs bg-foreground text-background shadow-lg pointer-events-none ${side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}>
          {content}
        </span>
      )}
    </span>
  )
}