'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const name = "Seif El-Din"
const subtitle = "Creative Designer"

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Name reveal with word-level animation (restored from original)
      const words = nameRef.current?.querySelectorAll('.word')
      if (words) {
        gsap.from(words, {
          y: '100%',
          opacity: 0,
          duration: 1.5,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.5,
        })
      }

      // Subtitle reveal
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 1.5,
        ease: 'power3.out',
      })

      // Scroll indicator
      gsap.from(scrollRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 2,
        ease: 'power2.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="home" ref={heroRef} className="hero">
      {/* Animated Background Gradient */}
      <motion.div
        className="hero-gradient"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          userSelect: 'none', 
          pointerEvents: 'none' 
        }}
      />

      <div className="hero-content">
        <h1 
          ref={nameRef} 
          className="hero-name"
          style={{ 
            overflow: 'visible',
            paddingTop: '0.2em'
          }}
        >
          <span style={{ 
            display: 'inline-block', 
            overflow: 'visible', 
            paddingBottom: '0.2em' 
          }}>
            <span className="word" style={{ display: 'inline-block' }}>Seif</span>
          </span>
          {' '}
          <span style={{ 
            display: 'inline-block', 
            overflow: 'visible', 
            paddingBottom: '0.2em' 
          }}>
            <span className="word" style={{ display: 'inline-block' }}>El-Din</span>
          </span>
        </h1>
        
        <p 
          ref={subtitleRef} 
          className="hero-subtitle"
          style={{ 
            marginTop: '1.5rem',
            letterSpacing: '0.3em'
          }}
        >
          {subtitle}
        </p>

        {/* CTA Button - restored and polished */}
        <motion.a
          href="#portfolio"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'inline-block',
            marginTop: '3rem',
            padding: '1rem 2.5rem',
            border: '1px solid #b9efa3',
            color: '#b9efa3',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            fontSize: '0.875rem',
            fontWeight: 500,
            position: 'relative',
            overflow: 'hidden',
            zIndex: 10,
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0a0a0f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#b9efa3'
          }}
        >
          <span style={{ position: 'relative', zIndex: 10 }}>View My Work</span>
          <motion.div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: '#b9efa3',
              y: '100%'
            }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.a>
      </div>

      {/* Scroll Indicator */}
      <div 
        ref={scrollRef} 
        className="scroll-indicator"
        style={{ 
          position: 'absolute',
          bottom: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <span style={{
          fontSize: '0.625rem',
          fontFamily: "'Gotham', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: 'rgba(255, 255, 255, 0.6)',
          transform: 'rotate(-90deg)',
          marginBottom: '2rem'
        }}>
          Scroll
        </span>
        <div style={{ 
          width: '1px', 
          height: '5rem', 
          background: 'rgba(185, 239, 163, 0.3)', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background: 'linear-gradient(to bottom, transparent, #b9efa3)'
            }}
            initial={{ y: '-100%' }}
            animate={{ y: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
