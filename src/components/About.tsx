'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toPublicSettingsImageUrl } from '@/lib/publicImageUrl'

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
      const lines = textRef.current?.querySelectorAll('.reveal-line')
      if (lines && lines.length > 0 && textRef.current) {
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

      const imageWrapper = imageRef.current?.querySelector('.about-image-wrapper')
      if (imageWrapper) {
        gsap.set(imageWrapper, {
          opacity: 0,
          y: 30,
          scale: 0.9,
        })
        
        gsap.to(imageWrapper, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: imageWrapper,
            start: 'top 85%',
          },
        })

        gsap.to(imageWrapper, {
          y: -8,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.4
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="about-container">
        <div ref={textRef} className="about-content">
          <div className="reveal-line" style={{ marginBottom: '2rem' }}>
            <h2 className="about-title" style={{ 
              fontSize: 'clamp(3rem, 6vw, 5rem)', 
              textTransform: 'lowercase',
              fontFamily: "'Mochi Boom', sans-serif"
            }}>about me</h2>
          </div>

          <div className="about-bio">
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Montserrat', sans-serif'"
            }}>
              I am a passionate Creative Designer and Visual Identity Specialist based in Cairo.
            </p>
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Montserrat', sans-serif'"
            }}>
              With a deep focus on storytelling through design, I help brands build unique
              personalities that resonate with their audience.
            </p>
            <p className="about-text-line reveal-line" style={{ 
              marginBottom: '1.5rem',
              fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Montserrat', sans-serif'"
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
                   fontFamily: "'Montserrat', sans-serif",
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

        <div ref={imageRef} className="about-image">
          <div className="about-image-wrapper">
            <div className="image-glow">
              <img 
                src={toPublicSettingsImageUrl('settings/Seif.img.png')} 
                alt="Seif El-Din" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 0 40px rgba(185, 239, 163, 0.15))'
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
