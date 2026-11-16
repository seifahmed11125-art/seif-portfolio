'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { JourneyData } from '@/lib/journey/types'
import LogoIntro from './LogoIntro'

type RuntimeApp = { destroy(): void; revealIntro(): void; resize(): void }
// Start fetching the small runtime as soon as its client module is evaluated.
const preparedRuntime = typeof window === 'undefined' ? null : import('@/lib/journey/runtime.mjs')

export default function MotionRuntime({ data, intro = false }: { data: JourneyData; intro?: boolean }) {
  const [showIntro, setShowIntro] = useState(intro)
  const [runtimeReady, setRuntimeReady] = useState(false)
  const appRef = useRef<RuntimeApp | null>(null)
  const finishIntro = useCallback(() => setShowIntro(false), [])
  const revealIntro = useCallback(() => appRef.current?.revealIntro(), [])
  useEffect(() => {
    let cancelled = false
    let app: RuntimeApp | undefined
    const runtime = preparedRuntime ?? import('@/lib/journey/runtime.mjs')
    runtime.then(({ mountApp }) => {
      if (cancelled) return
      app = mountApp(document, window, data)
      appRef.current = app
      setRuntimeReady(true)
      // Font delivery must not postpone the first usable scroll interaction.
      document.fonts?.ready.then(() => { if (!cancelled) app?.resize() })
    })
    return () => { cancelled = true; app?.destroy(); if (appRef.current === app) appRef.current = null }
  }, [data])
  useEffect(() => {
    if (runtimeReady && !showIntro) appRef.current?.revealIntro()
  }, [runtimeReady, showIntro])
  return showIntro ? <LogoIntro ready={runtimeReady} onExitStart={revealIntro} onComplete={finishIntro} /> : null
}
