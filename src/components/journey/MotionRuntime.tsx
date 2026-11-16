'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { JourneyData } from '@/lib/journey/types'
import LogoIntro from './LogoIntro'

export default function MotionRuntime({ data, intro = false }: { data: JourneyData; intro?: boolean }) {
  const [showIntro, setShowIntro] = useState(intro)
  const [runtimeReady, setRuntimeReady] = useState(false)
  const appRef = useRef<{ destroy(): void; revealIntro(): void } | null>(null)
  const finishIntro = useCallback(() => setShowIntro(false), [])
  const revealIntro = useCallback(() => appRef.current?.revealIntro(), [])
  useEffect(() => {
    let cancelled = false
    let app: { destroy(): void; revealIntro(): void } | undefined
    import('@/lib/journey/runtime.mjs').then(async ({ mountApp }) => {
      await document.fonts?.ready
      if (cancelled) return
      app = mountApp(document, window, data)
      appRef.current = app
      setRuntimeReady(true)
    })
    return () => { cancelled = true; app?.destroy(); if (appRef.current === app) appRef.current = null }
  }, [data])
  useEffect(() => {
    if (runtimeReady && !showIntro) appRef.current?.revealIntro()
  }, [runtimeReady, showIntro])
  return showIntro ? <LogoIntro ready={runtimeReady} onExitStart={revealIntro} onComplete={finishIntro} /> : null
}
