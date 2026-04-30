'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  'Brand Identity', 'Social Media Designs', 'Motion Graphics',
  'Print Designs', 'Presentation Designs'
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text lines animation - from hidden state (matching original)
      const lines = textRef.current?.querySelectorAll('.reveal-line')
      if (lines) {
        gsap.from(lines, {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
          },
        })
      }

      // Image parallax effect
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 85%',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="about-container">
        <div ref={imageRef} className="about-image">
          <div className="about-image-wrapper">
            {/* Visual element matching original */}
            <div style={{ 
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-1rem',
                border: '1px solid rgba(185, 239, 163, 0.2)',
                transform: 'translate(1rem, 1rem)',
                transition: 'transform 0.5s ease',
                zIndex: 0
              }} />
              <div style={{
                width: '100%',
                flex: 1,
                background: 'rgba(22, 31, 110, 0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(185, 239, 163, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center' as const,
                position: 'relative',
                zIndex: 1
              }}>
                {/* Top accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #b9efa3, transparent)'
                }} />
                
                <div>
                  <p style={{
                    fontFamily: "'Mochi Boom', sans-serif",
                    fontStyle: 'italic',
                    fontSize: '1.5rem',
                    color: '#b9efa3',
                    lineHeight: 1.4
                  }}>
                    "Design is the silent ambassador of your brand."
                  </p>
                  <p style={{
                    fontFamily: "'Gotham', sans-serif",
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(185, 239, 163, 0.6)',
                    marginTop: '0.5rem'
                  }}>
                    — Paul Rand
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={textRef} className="about-content">
          <div className="reveal-line" style={{ marginBottom: '2rem' }}>
            <h2 className="about-title" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', textTransform: 'lowercase' }}>about me</h2>
          </div>

          <div className="about-bio">
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Gotham', sans-serif"
            }}>
              I am a passionate Creative Designer and Visual Identity Specialist based in Cairo. 
            </p>
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Gotham', sans-serif"
            }}>
              With a deep focus on storytelling through design, I help brands build unique 
              personalities that resonate with their audience.
            </p>
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Gotham', sans-serif"
            }}>
              My approach combines strategic thinking with bold aesthetics, ensuring that 
              every project—from a single social media post to a full brand identity—delivers 
              impact and value.
            </p>
          </div>

          <div className="skill-tags" style={{ marginTop: '2rem' }}>
            {skills.map((skill) => (
              <motion.span
                key={skill}
                whileHover={{ 
                  backgroundColor: '#161f6e', 
                  color: '#b9efa3', 
                  borderColor: '#161f6e' 
                }}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #b9efa3',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: "'Gotham', sans-serif",
                  fontSize: '0.875rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginRight: '0.75rem',
                  marginBottom: '0.75rem'
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
