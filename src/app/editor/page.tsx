'use client'

import { useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorPage() {
  const router = useRouter()

  useLayoutEffect(() => {
    router.replace('/apps')
  }, [router])

  return null
}
