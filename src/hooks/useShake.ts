'use client'

import { useState, useCallback } from 'react'

export function useShake() {
  const [shaking, setShaking] = useState(false)
  const trigger = useCallback(() => {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }, [])
  return { shaking, trigger }
}