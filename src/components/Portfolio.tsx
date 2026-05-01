'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type Category, categories } from "../data/portfolio"
import Link from "next/link"
import { useProjects } from '@/lib/useProjects'
import { toPublicSettingsImageUrl } from '@/lib/publicImageUrl'

gsap.registerPlugin(ScrollTrigger)

interface PortfolioProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
  label?: string;
  showCTA?: boolean;
}

export function Portfolio({
  limit,
  showFilters = true,
  title = "Selected Works",
  label = "Portfolio",
  showCTA = false,
}: PortfolioProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeFilter, setActiveFilter] = useState<Category>("All")
  const { projects, loading } = useProjects()
  const [filteredProjects, setFilteredProjects] = useState(projects)

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label and title animation
      const label = sectionRef.current?.querySelector('.portfolio-label')
      const title = sectionRef.current?.querySelector('.portfolio-title')

      if (label) {
        gsap.from(label, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        })
      }

      if (title) {
        gsap.from(title, {
          y: 30,
          opacity: 0,
          duration: 1.2,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])

  useEffect(() => {
    // Project cards animation on filter change
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        const cards = containerRef.current.querySelectorAll('.project-card')
        if (cards.length > 0) {
          gsap.from(cards, {
            y: 30,
            opacity: 0,
            scale: 0.95,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          })
        }
      }
    }, containerRef)

    return () => ctx.revert()
  }, [activeFilter])

  const handleFilter = (category: Category) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.category === category));
    }
  }

  return (
    <section
      ref={sectionRef}
      id={showFilters ? "portfolio" : undefined}
      className="portfolio"
    >
      <div className="portfolio-container">
        <span className="portfolio-label">{label}</span>
        <h2 className="portfolio-title">{title}</h2>

        {showFilters && (
          <div className="portfolio-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => handleFilter(category)}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  background: activeFilter === category ? '#b9efa3' : 'transparent',
                  color: activeFilter === category ? '#0a0a0f' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${activeFilter === category ? '#b9efa3' : 'rgba(255, 255, 255, 0.1)'}`,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <motion.div
          ref={containerRef}
          layout
          className="portfolio-grid"
        >
          <AnimatePresence mode='popLayout'>
            {!loading && displayProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="project-card"
              >
                <div className="project-image">
                  <img
                    src={toPublicSettingsImageUrl(project.image || 'projects/placeholder.png')}
                    alt={project.title ?? 'Project'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div className="project-overlay">
                    <span className="project-view">View Project</span>
                  </div>
                </div>
                <div className="project-info">
                  <h3 className="project-title">{project.title ?? 'Untitled'}</h3>
                  <span className="project-category">{project.category ?? 'Uncategorized'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {showCTA && (
        <div className="portfolio-cta-wrapper">
          <Link href="/projects" className="cta-button-premium">
            View All Projects
          </Link>
        </div>
      )}
    </section>
  )
}

export default Portfolio
