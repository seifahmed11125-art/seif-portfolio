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
    <>
      <nav className="navbar" ref={navRef}>
        <Link href="/" className="navbar-logo" onClick={closeMenu}>
          <motion.div whileHover={{ scale: 1.05 }} className="logo-wrapper">
            <img src="/Seif-Logo.png" alt="Seif El-Din Logo" className="logo-img" />
          </motion.div>
        </Link>

        <div className="desktop-nav">
          {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
          ))}
        </div>

        <button onClick={toggleMenu} className="mobile-menu-btn" aria-label="Toggle menu">
          <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className="scroll-progress">
          <div className="scroll-progress-bar" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu} className="mobile-menu-item">{item}</a>
          ))}
        </div>
      )}
    </>
  )
}

export default Navbar
