'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function LogoIntro({ onComplete, ready = true }: { onComplete: () => void; ready?: boolean }) {
  const completed = useRef(false)
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [exiting, setExiting] = useState(false)
  const finish = useCallback(() => {
    if (completed.current) return
    completed.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minimum = window.setTimeout(() => setMinimumElapsed(true), reduced ? 180 : 1350)
    return () => {
      window.clearTimeout(minimum)
      document.documentElement.style.overflow = previousOverflow
    }
  }, [])
  useEffect(() => {
    if (!ready || !minimumElapsed) return
    setExiting(true)
    const fallback = window.setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 750)
    return () => window.clearTimeout(fallback)
  }, [ready, minimumElapsed, finish])

  return <div className="logo-intro" data-exiting={exiting} role="status" aria-label="Loading portfolio" onAnimationEnd={event => {
    if (exiting && event.target === event.currentTarget) finish()
  }}>
    <div className="logo-intro-entry">
      <div className="logo-intro-halo" aria-hidden="true" />
      <svg className="logo-intro-ring" viewBox="0 0 132 132" fill="none" aria-hidden="true"><circle cx="66" cy="66" r="61" /><path d="M5 37V5H37M95 5H127V37M127 95V127H95M37 127H5V95" /></svg>
      <div className="logo-intro-mark"><img src="/journey/logo.webp" alt="Seif El Din Logo" width="215" height="280" fetchPriority="high" /></div>
    </div>
    <div className="logo-intro-track" aria-hidden="true"><span /></div>
    <span className="sr-only">Loading portfolio…</span>
  </div>
}
