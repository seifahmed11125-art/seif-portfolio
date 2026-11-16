'use client'

import { useCallback, useEffect, useRef } from 'react'

export default function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const completed = useRef(false)
  const finish = useCallback(() => {
    if (completed.current) return
    completed.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fallback = window.setTimeout(finish, reduced ? 450 : 3300)
    return () => {
      window.clearTimeout(fallback)
      document.documentElement.style.overflow = previousOverflow
    }
  }, [finish])

  return <div className="logo-intro" role="status" aria-label="Loading portfolio" onAnimationEnd={event => {
    if (event.target === event.currentTarget) finish()
  }}>
    <div className="logo-intro-entry"><div className="logo-intro-pulse">
      <img src="/journey/logo.webp" alt="Seif El-Din Logo" width="215" height="280" fetchPriority="high" />
    </div></div>
    <div className="logo-intro-track" aria-hidden="true"><span /></div>
    <span className="sr-only">Loading portfolio…</span>
  </div>
}
