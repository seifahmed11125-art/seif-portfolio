'use client'

import { useCallback, useEffect, useState } from 'react'
import type { JourneyData } from '@/lib/journey/types'
import LogoIntro from './LogoIntro'

export default function MotionRuntime({ data, intro = false }: { data: JourneyData; intro?: boolean }) {
  const [showIntro, setShowIntro] = useState(intro)
  const finishIntro = useCallback(() => setShowIntro(false), [])
  useEffect(() => {
    let cancelled = false
    let app: { destroy(): void } | undefined
    import('@/lib/journey/runtime.mjs').then(({ mountApp }) => {
      if (!cancelled && !showIntro) app = mountApp(document, window, data)
    })
    return () => { cancelled = true; app?.destroy() }
  }, [data, showIntro])
  return showIntro ? <LogoIntro onComplete={finishIntro} /> : null
}
