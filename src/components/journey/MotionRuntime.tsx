'use client'

import { useEffect } from 'react'
import type { JourneyData } from '@/lib/journey/types'

export default function MotionRuntime({ data }: { data: JourneyData }) {
  useEffect(() => {
    let cancelled = false
    let app: { destroy(): void } | undefined
    import('@/lib/journey/runtime.mjs').then(({ mountApp }) => {
      if (!cancelled) app = mountApp(document, window, data)
    })
    return () => { cancelled = true; app?.destroy() }
  }, [data])
  return null
}
