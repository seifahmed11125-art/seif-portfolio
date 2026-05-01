'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate logo in
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0.8 })
        gsap.to(logoRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
        })
      
        // Sophisticated floating/pulse animation
        gsap.to(logoRef.current, {
          y: -10,
          scale: 1.05,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      
        // Subtle rotation for premium feel
        gsap.to(logoRef.current, {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: 'none',
        })
      }

      // Exit animation
      gsap.to(containerRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        delay: 2.2,
        onComplete: () => {
          setIsVisible(false)
          onLoadingComplete()
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [onLoadingComplete])

  if (!isVisible) return null

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0f',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      <div 
        ref={logoRef}
        style={{
          opacity: 0,
          scale: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
          src="/icon.png" 
          alt="Loading Icon" 
          style={{ 
            width: '180px', 
            height: 'auto',
            filter: 'drop-shadow(0 0 40px rgba(185, 239, 163, 0.2))'
          }} 
        />
      </div>
      <div style={{
        width: '120px',
        height: '1px',
        background: 'rgba(185, 239, 163, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div 
          ref={progressRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '0%',
            background: '#b9efa3',
          }}
        />
      </div>
    </div>
  )
}

export default LoadingScreen
