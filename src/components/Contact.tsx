'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/seif_eldin0?igsh=enJ0NWt6MWt4ZzBh&utm_source=qr' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/seif-ahmed-a62b3a212?utm_source=share&utm_content=profile&utm_medium=member_ios' },
  { name: 'Behance', url: 'https://www.behance.net/seifahmed11125' },
  { name: 'WhatsApp', url: 'https://wa.me/201126862871' },
]

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          },
        })
      }

      // Links stagger animation
      const links = linksRef.current?.querySelectorAll('.contact-link')
      if (links) {
        gsap.from(links, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: linksRef.current,
            start: 'top 85%',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const [copied, setCopied] = useState(false)
  
  const copyEmail = () => {
    navigator.clipboard.writeText('seifeldinahmed11125@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" ref={sectionRef} className="contact">
      <div className="contact-container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginBottom: '5rem'
        }}>
          <span style={{
            fontFamily: "'Gotham', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: '#b9efa3',
            display: 'block',
            marginBottom: '2rem'
          }}>
            Get In Touch
          </span>
          <h2 
            ref={titleRef}
            className="contact-title"
            style={{ 
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              fontFamily: "'Mochi Boom', sans-serif",
              color: '#ffffff',
              lineHeight: 0.9,
              marginBottom: '3rem',
              textAlign: 'center'
            }}
          >
            Let's Work <span style={{ color: '#b9efa3' }}>Together</span>
          </h2>
        </div>

        <div ref={linksRef} style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '3rem',
          width: '100%',
          marginBottom: '4rem'
        }}>
          {socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontFamily: "'Gotham', sans-serif",
                color: '#ffffff',
                textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              whileHover={{ color: '#b9efa3' }}
            >
              <motion.span 
                style={{ position: 'relative', display: 'inline-block' }}
              >
                {link.name}
                <motion.div 
                  style={{ 
                    position: 'absolute', 
                    bottom: -4, 
                    left: 0, 
                    height: '1px', 
                    background: '#b9efa3',
                    width: 0
                  }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.span>
            </motion.a>
          ))}
        </div>

        <motion.div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: '100%'
          }}
        >
          <span style={{
            fontFamily: "'Gotham', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            Email
          </span>
          <a 
            href="mailto:seifeldinahmed11125@gmail.com"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontFamily: "'Mochi Boom', sans-serif",
              color: '#ffffff',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              letterSpacing: '0.05em',
              position: 'relative',
              paddingBottom: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#b9efa3';
              const line = e.currentTarget.querySelector('.email-line') as HTMLDivElement;
              if (line) line.style.transform = 'scaleX(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ffffff';
              const line = e.currentTarget.querySelector('.email-line') as HTMLDivElement;
              if (line) line.style.transform = 'scaleX(0)';
            }}
          >
            seifeldinahmed11125
            <div 
              className="email-line"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: '#b9efa3',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </a>
        </motion.div>
      </div>

      <footer className="contact-footer" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', width: '100%', borderTop: 'none', padding: '4rem 0 2rem' }}>
        <p style={{ fontFamily: "'Gotham', sans-serif", fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0.1em' }}>
          &copy; {new Date().getFullYear()} Seif El-Din. All rights reserved.
        </p>
      </footer>
    </section>
  )
}

export default Contact
