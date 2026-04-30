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
  const [menuOpen, setMenuOpen] = useState(false)

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

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav 
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '76px',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(185, 239, 163, 0.1)',
        maxWidth: '100%',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', alignSelf: 'center' }} onClick={closeMenu}>
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
              height: '40px', 
              width: '40px',
              objectFit: 'contain'
            }} 
          />
        </motion.div>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="desktop-nav">
        {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
             style={{
               fontFamily: "'Montserrat', sans-serif",
               fontSize: '0.8rem',
               letterSpacing: '0.15em',
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

      {/* Mobile Hamburger */}
      <button 
        onClick={toggleMenu}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
        }}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        <div style={{ 
          width: '24px', 
          height: '2px', 
          background: '#b9efa3', 
          position: 'relative',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: 0,
            width: '24px',
            height: '2px',
            background: '#b9efa3',
            transition: 'all 0.3s ease',
            transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: 0,
            width: '24px',
            height: '2px',
            background: '#b9efa3',
            transition: 'all 0.3s ease',
            transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
          }} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            zIndex: 99,
          }}
          className="mobile-menu"
        >
          {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={closeMenu}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.2rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#b9efa3' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)' }}
            >
              {item}
            </a>
          ))}
        </div>
      )}

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
