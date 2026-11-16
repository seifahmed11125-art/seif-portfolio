const logoPaths = [
  'M158 94H331V126C331 155 308 178 279 178H115V137C115 113 134 94 158 94Z',
  'M115 178H275C306 178 331 203 331 234V262H170C140 262 115 237 115 207V178Z',
  'M168 262H331V294C331 323 308 346 279 346H115V315C115 286 139 262 168 262Z',
]
const seams = ['M115 137H331', 'M116 179L330 261', 'M115 315H331']

function MobileLogo() {
  return <div className="reel-mobile-art" aria-hidden="true">
    <svg className="reel-mobile-grid" viewBox="0 0 440 440" fill="none">
      <defs><pattern id="reel-mobile-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".85" fill="#b9efa3" fillOpacity=".29" /></pattern></defs>
      <path d="M39 39H401V401H39Z" fill="url(#reel-mobile-dots)" />
      <circle cx="220" cy="220" r="172" stroke="currentColor" strokeOpacity=".4" strokeDasharray="4 7" />
      <circle cx="220" cy="220" r="126" stroke="currentColor" strokeOpacity=".2" />
      <path d="M220 21V419M21 220H419M54 54L386 386M386 54L54 386" stroke="currentColor" strokeOpacity=".17" />
      <path d="M79 136H361M79 220H361M79 304H361" stroke="currentColor" strokeOpacity=".46" strokeDasharray="3 4" />
    </svg>
    {['a', 'b', 'c', 'dot'].map((part, index) => <div key={part} className="reel-mobile-piece" data-logo-part={part}>
      <svg viewBox="0 0 440 440" fill="none">{index < 3 ? <>
        <path d={logoPaths[index]} fill="#b9efa3" stroke="#0a0a0f" strokeWidth="1.25" />
        <path d={seams[index]} stroke="#171d2c" strokeOpacity=".22" />
      </> : <circle cx="359" cy="325" r="21" fill="#b9efa3" />}</svg>
    </div>)}
  </div>
}

export default function HeroMarkup() {
  return (
    <section id="home" className="director-reel" aria-labelledby="home-title">
      <div className="reel-stage">
        <div className="reel-grid" aria-hidden="true" />
        <div className="reel-media" aria-hidden="true">
          <div className="reel-paper" />
          <svg className="reel-mark" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="reel-dot-grid" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".85" fill="#b9efa3" fillOpacity=".29" /></pattern>
            </defs>
            <g className="reel-drawing">
              <path d="M39 39H401V401H39Z" fill="url(#reel-dot-grid)" />
              <circle cx="220" cy="220" r="172" stroke="currentColor" strokeOpacity=".40" strokeDasharray="4 7" />
              <circle cx="220" cy="220" r="126" stroke="currentColor" strokeOpacity=".2" />
              <path d="M220 21V419M21 220H419M54 54L386 386M386 54L54 386" stroke="currentColor" strokeOpacity=".17" />
              <path d="M79 136H361M79 220H361M79 304H361" stroke="currentColor" strokeOpacity=".46" strokeDasharray="3 4" />
              <path d="M39 55V39H55M385 39H401V55M401 385V401H385M55 401H39V385" stroke="currentColor" strokeWidth="1.4" />
            </g>
            <g className="reel-piece reel-piece-a">
              <path d={logoPaths[0]} />
              <path className="reel-piece-seam" d="M115 137H331" />
            </g>
            <g className="reel-piece reel-piece-b">
              <path d={logoPaths[1]} />
              <path className="reel-piece-seam" d="M116 179L330 261" />
            </g>
            <g className="reel-piece reel-piece-c">
              <path d={logoPaths[2]} />
              <path className="reel-piece-seam" d="M115 315H331" />
            </g>
            <circle className="reel-mark-dot" cx="359" cy="325" r="21" />
          </svg>
          <MobileLogo />
        </div>
        <div className="reel-guides" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="reel-intro">
          <p className="reel-role"><span /> DESIGN &amp; VISUALS</p>
          <h1 id="home-title">Seif<br />{' '}El Din</h1>
          <p className="reel-sub hero-role">Graphic Designer &amp; Visual Creator</p>
          <a href="#portfolio" data-station="3" className="reel-work">View my work</a>
        </div>
        <div className="reel-statement" aria-hidden="true">
          <p className="reel-line">Creative<br />{' '}Designer</p>
        </div>
        <div className="reel-controls">
          <button type="button" className="reel-cue"><span className="reel-cue-arrow" aria-hidden="true">↓</span> <span className="reel-cue-text">Scroll to assemble</span></button>
          <div className="reel-timeline" aria-hidden="true">
            <span className="reel-counter">01</span><div className="reel-progress"><i /></div><span>03</span>
          </div>
          <a href="#about" data-station="1" className="reel-next">About me</a>
        </div>
      </div>
    </section>
  )
}
