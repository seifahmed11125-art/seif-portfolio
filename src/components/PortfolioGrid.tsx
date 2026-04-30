'use client'

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Category, projects, categories } from "../data/portfolio";
import Link from "next/link";

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
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label reveal
      gsap.to('.portfolio-label', {
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

      // Title reveal
      gsap.to('.portfolio-title', {
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

      // Filters stagger
      if (showFilters) {
        gsap.fromTo('.filter-btn',
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.portfolio-filters',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Small delay to allow DOM to update after filter change
    const timer = setTimeout(() => {
      if (containerRef.current) {
        gsap.fromTo(".project-card", 
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
          {displayProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <div className="project-image-placeholder">
                  <span>{project.category}</span>
                </div>
                <div className="project-overlay">
                  <span className="project-view">View Project</span>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <span className="project-category">{project.category}</span>
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
