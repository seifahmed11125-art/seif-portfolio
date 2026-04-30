'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollY / docHeight : 0
      setScrollProgress(Math.min(progress, 1))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(185, 239, 163, 0.1)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img 
            src="/Seif-Logo.png" 
            alt="Seif El-Din Logo" 
            style={{ 
              height: '55px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </motion.div>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              fontFamily: "'Gotham', sans-serif",
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#b9efa3' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)' }}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Scroll Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '1px',
        background: 'rgba(185, 239, 163, 0.1)',
      }}>
        <div style={{
          width: `${scrollProgress * 100}%`,
          height: '100%',
          background: '#b9efa3',
          transformOrigin: 'left',
          transition: 'width 0.1s linear',
        }} />
      </div>
    </nav>
  )
}

export default Navbar
