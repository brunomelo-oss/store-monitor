'use client'

import { ErrorState } from '@/components/ErrorState'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />
}
