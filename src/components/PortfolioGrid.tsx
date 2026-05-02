'use client'

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Category, categories } from "../data/portfolio";
import Link from "next/link";
import { useProjects } from '@/lib/useProjects'
import { toPublicSettingsImageUrl } from "@/lib/publicImageUrl";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioGridProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
  label?: string;
  showCTA?: boolean;
}

export function PortfolioGrid({
  limit,
  showFilters = true,
  title = "Selected Works",
  label = "Portfolio",
  showCTA = false,
}: PortfolioGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const { projects, loading } = useProjects()
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label reveal
      const label = sectionRef.current?.querySelector('.portfolio-label')
      if (label) {
        gsap.to(label, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Title reveal
      const title = sectionRef.current?.querySelector('.portfolio-title')
      if (title) {
        gsap.to(title, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Filters stagger
      if (showFilters) {
        const filterBtns = sectionRef.current?.querySelectorAll('.filter-btn')
        if (filterBtns && filterBtns.length > 0) {
          gsap.fromTo(filterBtns,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current?.querySelector('.portfolio-filters') || sectionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])

  useEffect(() => {
    // Small delay to allow DOM to update after filter change
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (containerRef.current) {
          const cards = containerRef.current.querySelectorAll(".project-card");
          if (cards && cards.length > 0) {
            gsap.fromTo(cards,
              { y: 20, opacity: 0, scale: 0.98 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
              }
            );
          }
        }
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, [activeFilter]);

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
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div ref={containerRef} className="portfolio-grid">
          {!loading && displayProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img
                  src={toPublicSettingsImageUrl(project.image || 'projects/placeholder.png')}
                  alt={project.title ?? 'Project'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div className="project-overlay">
                  <a className="project-view" href={project.external_link || '/'} target="_blank" rel="noopener noreferrer">View Project</a>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title ?? 'Untitled'}</h3>
                <span className="project-category">{project.category ?? 'Uncategorized'}</span>
              </div>
            </div>
          ))}
        </div>
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

export default PortfolioGrid;
