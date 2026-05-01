'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { toPublicSettingsImageUrl } from '@/lib/publicImageUrl'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate logo in
      if (logoRef.current) {
        // Set initial state
        gsap.set(logoRef.current, {
          opacity:0,
          scale: 0.5,
        })
        
        // Animate logo in
        gsap.to(logoRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
        })
       
        // Sophisticated floating/pulse animation
        gsap.to(logoRef.current, {
          y: -12,
          scale: 1.08,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
       
        // Subtle rotation for premium feel
        gsap.to(logoRef.current, {
          rotation: 360,
          duration: 25,
          repeat: -1,
          ease: 'none',
        })
      }

      // Animate progress line
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: '100%',
          duration: 1.8,
          ease: 'power2.inOut',
          delay: 0.3,
        })
      }

      // Exit animation
      if (containerRef.current) {
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
      }
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
        <img 
          ref={logoRef}
          src={toPublicSettingsImageUrl('/icon.png')} 
          alt="Loading Icon" 
          style={{ 
            opacity: 0,
            width: 'clamp(150px, 25vw, 350px)', 
            height: 'auto',
            filter: 'drop-shadow(0 0 60px rgba(185, 239, 163, 0.3))'
          }} 
        />
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
