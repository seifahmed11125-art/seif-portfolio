'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: '01',
    name: 'Brand Identity',
    description: 'Defining unique brand personalities through strategic visual storytelling, bespoke typography, and cohesive color systems.',
  },
  {
    number: '02',
    name: 'Social Media Designs',
    description: 'Designing high-engagement digital content and scroll-stopping visuals that amplify brand presence across social ecosystems.',
  },
  {
    number: '03',
    name: 'Motion Graphics',
    description: 'Transforming static concepts into dynamic narratives through fluid animation and high-impact cinematic transitions.',
  },
  {
    number: '04',
    name: 'Print Designs',
    description: 'Delivering precision-crafted physical collateral, from luxury packaging to editorial layouts, that leave a lasting tactile impression.',
  },
  {
    number: '05',
    name: 'Presentation Designs',
    description: 'Elevating data and vision into persuasive, authority-driven pitch decks that ensure clarity and strategic impact.',
  },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Services scroll animation
      const items = servicesRef.current?.querySelectorAll('.service-item')
      if (items) {
        gsap.fromTo(items, 
          { y: 60, opacity: 0 },
          { 
            y: 0,
            opacity: 1, 
            duration: 1, 
            stagger: 0.2, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: servicesRef.current,
              start: 'top 95%',
            },
          }
        )
        ScrollTrigger.refresh()
      }
    }, sectionRef)

    return () => {
      ctx.revert()
      // Fallback: ensure items are visible if ScrollTrigger fails
      setTimeout(() => {
        const items = servicesRef.current?.querySelectorAll('.service-item')
        if (items) {
          items.forEach(item => (item as HTMLElement).style.opacity = '1')
        }
      }, 2000)
    }
  }, [])

  return (
    <section id="services" ref={sectionRef} className="services">
      <div className="services-container">
        <span className="services-label">What I Do</span>
        <h2 className="services-title">Services</h2>

        <div ref={servicesRef} style={{ maxWidth: '4xl', margin: '0 auto' }}>
           {services.map((service, index) => (
               <div 
                 key={service.number}
                 className="service-item"
                 style={{ 
                   position: 'relative',
                   borderTop: index === 0 ? '1px solid rgba(185, 239, 163, 0.1)' : 'none',
                   cursor: 'pointer',
                   zIndex: 0
                 }}
                 onMouseEnter={() => setHoveredIndex(index)}
                 onMouseLeave={() => setHoveredIndex(null)}
               >
                {/* Left accent line */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: '100%',
                    background: '#b9efa3',
                    originY: 0,
                    zIndex: 1
                  }}
                   initial={{ scaleY: 0 }}
                   animate={{ scaleY: hoveredIndex === index ? 1 : 0 }}
                   transition={{ duration:0.5, ease: "easeOut" }}
                  />
                 
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 2 }}>
                  <div className="service-number">{service.number}</div>
                  <h3 className="service-title">{service.name}</h3>
                 
                  <motion.span 
                    style={{ 
                      marginLeft: 'auto',
                      fontSize: '1.5rem',
                      color: '#b9efa3',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ 
                      y: hoveredIndex === index ? 0 : -8, 
                      opacity: hoveredIndex === index ? 1 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    ↓
                  </motion.span>
                </div>
                
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ overflow: 'hidden', paddingLeft: '1.5rem' }}
                    >
                      <p className="service-description">{service.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

               {/* Hover Background */}
                <motion.div
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'rgba(185, 239, 163, 0.1)', 
                    zIndex: -1,
                    originX: 0,
                    pointerEvents: 'none'
                  }}
                   initial={{ scaleX: 0 }}
                   whileHover={{ scaleX: 1 }}
                   transition={{ duration: 0.5, ease: "easeInOut" }}
                 />
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(185, 239, 163, 0.1)' }} />
        </div>
      </div>
    </section>
  )
}

export default Services
