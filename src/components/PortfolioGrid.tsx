'use client'

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AI_VIDEOS_CATEGORY, type Category, categories } from "../data/portfolio";
import Link from "next/link";
import { useProjects } from '@/lib/useProjects'
import { toPublicSettingsImageUrl } from "@/lib/publicImageUrl";
import { parseProjectLink } from "@/lib/projectMedia";
import ProjectVideo from "./ProjectVideo";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioGridProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
  label?: string;
  showCTA?: boolean;
  wideVideos?: boolean;
}

export function PortfolioGrid({
  limit,
  showFilters = true,
  title = "Selected Works",
  label = "Portfolio",
  showCTA = false,
  wideVideos = false,
}: PortfolioGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const { projects, loading, error } = useProjects();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((project) => project.category === activeFilter);
  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;
  const cards = displayProjects.map((project) => {
    const isVideoProject = project.category === AI_VIDEOS_CATEGORY;
    const projectLink = parseProjectLink(project.external_link);
    const legacyVideo = isVideoProject && projectLink && /\.(mp4|webm)$/i.test(projectLink.pathname);
    const videoUrl = project.video_url || (legacyVideo ? projectLink.href : undefined);

    return { project, isVideoProject, projectLink, legacyVideo, videoUrl };
  });

  if (wideVideos) {
    cards.sort((a, b) => Number(Boolean(b.videoUrl)) - Number(Boolean(a.videoUrl)));
  }

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
    if (loading) return;

    const cards = containerRef.current?.querySelectorAll('.project-card');
    if (!cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cards,
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeFilter, loading, projects]);

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
                type="button"
                aria-pressed={activeFilter === category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div ref={containerRef} className="portfolio-grid" aria-busy={loading}>
          {!loading && cards.map(({ project, isVideoProject, projectLink, legacyVideo, videoUrl }) => {
            const isBehance = projectLink && /(^|\.)behance\.net$/i.test(projectLink.hostname);
            const title = project.title ?? 'Untitled';
            const imageUrl = project.image && (
              /^https?:\/\//i.test(project.image)
                ? project.image
                : toPublicSettingsImageUrl(project.image)
            );

            return (
              <div key={project.id} className={wideVideos && videoUrl ? 'project-card project-card--wide' : 'project-card'}>
                {videoUrl ? (
                  <ProjectVideo title={title} coverUrl={imageUrl} videoUrl={videoUrl} />
                ) : (
                  <div className="project-image">
                    <img
                      src={imageUrl || toPublicSettingsImageUrl('projects/placeholder.png')}
                      alt={project.title ?? 'Project'}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {!isVideoProject && projectLink && (
                      <div className="project-overlay">
                        <a className="project-view" href={projectLink.href} target="_blank" rel="noopener noreferrer">View Project</a>
                      </div>
                    )}
                  </div>
                )}
                <div className="project-info">
                  <h3 className="project-title">{title}</h3>
                  <span className="project-category">{project.category ?? 'Uncategorized'}</span>
                </div>
                {isVideoProject && projectLink && (
                  <a className="project-video-link" href={projectLink.href} target="_blank" rel="noopener noreferrer">
                    {isBehance ? 'View on Behance' : legacyVideo ? 'Open video' : 'View Project'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        {!loading && activeFilter === AI_VIDEOS_CATEGORY && displayProjects.length === 0 && (
          <p className="portfolio-empty" role="status">
            {error ? 'Could not load projects.' : 'No AI video projects yet.'}
          </p>
        )}
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
