import type { CSSProperties } from 'react'
import HeroMarkup from './HeroMarkup'
import MotionRuntime from './MotionRuntime'
import type { JourneyData, JourneyProject } from '@/lib/journey/types'

const stops = ['Home', 'About', 'Services', 'Portfolio', 'Contact']
const hashes = ['home', 'about', 'services', 'portfolio', 'contact']

function Header() {
  return <header className="site-header">
    <a className="brand" href="/#home" data-station="0" aria-label="Seif El-Din — Home"><img src="/journey/logo.webp" alt="Seif El-Din Logo" width="30" height="39" /><span>Seif El-Din<small>DESIGN &amp; VISUALS</small></span></a>
    <nav aria-label="Main navigation">{stops.map((name, i) => <a key={name} href={`/#${hashes[i]}`} data-station={i}>{name}</a>)}</nav>
  </header>
}

function Filters({ data, selected = 'All' }: { data: JourneyData; selected?: string }) {
  return <div className="category-filters" aria-label="Portfolio categories">{data.categories.map(category => <button key={category} type="button" className="category-filter" aria-pressed={category === selected} data-category={category}>{category}</button>)}</div>
}

function ProjectCard({ project }: { project: JourneyProject }) {
  const ai = project.category === 'AI Videos'
  return <article className={`project-card project-card--${ai ? 'video' : 'design'}`} data-project-id={project.id}>
    {ai ? <div className="project-media inline-video" data-video-project={project.id} style={{ '--media-aspect': '16 / 9' } as CSSProperties}>
      <video className="inline-video-player" data-inline-player="" poster={project.cover} playsInline preload="none" aria-label={project.title} hidden />
      <button className="inline-video-trigger" type="button" data-play-video={project.id} aria-label={`Play ${project.title}`}>
        <img src={project.cover} alt={project.title} width="640" height="360" loading="lazy" decoding="async" draggable={false} />
        <span className="project-play" aria-hidden="true">▶</span>
      </button>
      <p className="inline-video-error" role="status" hidden>Could not play this video. Try again.</p>
    </div> : <a className="project-open" href={project.external_link || '#'} target="_blank" rel="noopener noreferrer" aria-label={`View Project: ${project.title}`} data-open-project={project.id}>
      <div className="project-media" style={{ '--media-aspect': ai ? '16 / 9' : '4 / 5' } as CSSProperties}>
        <img src={project.cover} alt={project.title} width={ai ? 640 : 400} height={ai ? 360 : 500} loading="lazy" decoding="async" draggable={false} />
        <span className="project-overlay">View Project <span aria-hidden="true">↗</span></span>
      </div>
    </a>}
    <div className="project-meta"><h3>{project.title}</h3><span>{project.category}</span></div>
    {ai && project.external_link && <a className="project-external" href={project.external_link} target="_blank" rel="noopener noreferrer">View on Behance ↗</a>}
  </article>
}

function EmptyProjects({ unavailable, empty, page }: { unavailable: boolean; empty: boolean; page: 'home' | 'projects' }) {
  return <p className="projects-empty" role="status" hidden={!empty}>{unavailable ? <>Projects are temporarily unavailable. <a className="text-link" href={`${page === 'home' ? '/' : '/projects'}?refresh=${Date.now()}${page === 'home' ? '#portfolio' : ''}`}>Try again ↻</a></> : '0 projects'}</p>
}

function Dialog() {
  return <dialog className="project-dialog" aria-labelledby="project-dialog-title"><div className="project-dialog-inner">
    <button className="dialog-close text-link" type="button">← Back</button><div className="dialog-layout"><div className="dialog-media project-media" /><div className="dialog-copy"><p className="eyebrow dialog-category" /><h2 id="project-dialog-title" /><p className="dialog-description" /><a className="outlined-link dialog-external" target="_blank" rel="noopener noreferrer">View on Behance <span aria-hidden="true">↗</span></a></div></div>
  </div></dialog>
}

function JourneyFooter() {
  return <footer className="journey-controls"><button className="journey-back text-link" type="button">← <span>Home</span></button>
    <div className="journey-route" aria-label="Journey progress"><span className="station-number">02</span><div className="journey-route-track"><span className="journey-route-progress" />{stops.map((name, i) => <button key={name} type="button" data-station={i} aria-label={name} aria-current={i === 1 ? 'step' : 'false'}><span /></button>)}</div><span>05</span></div>
    <button className="journey-next text-link" type="button"><span>Services</span> <span aria-hidden="true">↘</span></button>
  </footer>
}

export default function PortfolioShell({ data, page = 'home', unavailable = false, category = 'All' }: { data: JourneyData; page?: 'home' | 'projects'; unavailable?: boolean; category?: string }) {
  const home = page === 'home', featured = data.projects.slice(0, 4)
  const selected = data.categories.includes(category) ? category : 'All'
  const allProjects = selected === 'All' ? data.projects : data.projects.filter(project => project.category === selected)
  return <div className="portfolio-experience" data-page={page}><Header />
    {home ? <main className="site-main"><HeroMarkup /><div className="journey-scroll" id="journey-scroll"><div className="journey-shell" id="journey">
      <div className="atmosphere" aria-hidden="true" /><canvas className="world" aria-hidden="true" /><div className="vignette" aria-hidden="true" />
      <div className="world-content" aria-label="Portfolio journey">
        <section className="station about-station" id="about" data-index="1" aria-labelledby="about-title"><div className="about-layout scene-content">
          <img className="about-portrait" src="/journey/portrait.jpg" alt="Seif El-Din" width="548" height="1000" loading="lazy" decoding="async" />
          <div className="about-copy content-scroll"><h2 id="about-title">{data.aboutTitle}</h2>{data.about.map(text => <p key={text}>{text}</p>)}<p className="signature">{data.statement}</p></div>
        </div></section>
        <section className="station services-station" id="services" data-index="2" aria-labelledby="services-title" aria-hidden="true" inert><div className="services-layout scene-content">
          <div className="services-index"><p className="eyebrow">{data.serviceLabel}</p><h2 id="services-title">{data.serviceTitle}</h2><div className="service-list" aria-label="Specialties">{data.services.map((service, i) => <button key={service.name} className="service-tab" type="button" data-service={i} aria-pressed={i === 0}><span>0{i + 1}</span>{service.name}</button>)}</div></div>
          <div className="deck-space" aria-label="Service cards"><div className="deck-shadow" aria-hidden="true" /><div className="service-deck" aria-live="polite">{data.services.slice(0, 3).map((service, i) => <article key={service.name} className={`service-card service-${['current', 'under', 'bottom'][i]}`} data-service-id={i} aria-hidden={i !== 0}><span className="service-number">0{i + 1} / 06</span><h3>{service.name}</h3><p>{service.description}</p></article>)}</div><div className="deck-controls"><button className="round-button service-prev" type="button" aria-label="Previous service">←</button><button className="round-button service-next" type="button" aria-label="Next service">→</button></div></div>
        </div></section>
        <section className="station work-station" id="portfolio" data-index="3" aria-labelledby="portfolio-title" aria-hidden="true" inert><div className="work-layout scene-content">
          <div className="work-heading"><div><p className="eyebrow">{data.portfolioLabel}</p><h2 id="portfolio-title">{data.portfolioTitle}</h2></div><div className="gallery-controls"><span className="gallery-count" aria-live="polite">01 / {String(featured.length).padStart(2, '0')}</span><button className="round-button gallery-prev" type="button" aria-label="Previous project">←</button><button className="round-button gallery-next" type="button" aria-label="Next project">→</button></div></div>
          <Filters data={data} /><div className="gallery-window" aria-label="Selected projects"><div className="gallery-track">{featured.map(project => <ProjectCard key={project.id} project={project} />)}</div></div><EmptyProjects unavailable={unavailable} empty={featured.length === 0} page={page} /><a className="outlined-link view-all" href="/projects">View All Projects <span aria-hidden="true">↗</span></a>
        </div></section>
        <section className="station contact-station" id="contact" data-index="4" aria-labelledby="contact-title" aria-hidden="true" inert><div className="contact-layout scene-content"><p className="eyebrow">{data.contactLabel}</p><h2 id="contact-title">Let's Work <span>Together</span></h2><div className="social-links">{data.socials.map(social => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">{social.name} <span aria-hidden="true">↗</span></a>)}</div><p className="email-label">Email</p><a className="contact-email" href={`https://mail.google.com/mail/?view=cm&to=${data.email}`} target="_blank" rel="noopener noreferrer">{data.email}</a><p className="copyright">{data.copyright}</p></div></section>
      </div><JourneyFooter />
    </div></div></main> : <main className="projects-page"><a className="text-link back-to-portfolio" href="/#portfolio">← Portfolio</a><div className="projects-heading"><div><p className="eyebrow">{data.allProjectsLabel}</p><h1>{data.allProjectsTitle}</h1></div><span className="all-project-count">{allProjects.length} projects</span></div><Filters data={data} selected={selected} /><div className="all-project-grid">{allProjects.map(project => <ProjectCard key={project.id} project={project} />)}</div><EmptyProjects unavailable={unavailable} empty={allProjects.length === 0} page={page} /><p className="copyright">{data.copyright}</p></main>}
    <Dialog /><p className={`sr-only ${home ? 'station-announcement' : 'filter-announcement'}`} aria-live="polite">{home ? 'Home' : 'All Projects'}</p><MotionRuntime data={data} intro={home} />
  </div>
}
