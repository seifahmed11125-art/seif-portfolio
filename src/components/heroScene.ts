const compactLayout = '(max-width: 700px)'

const stageLabels = ['Scroll to assemble', 'Finish sequence', 'Replay sequence']
const pieces = [
  { name: 'part-a', x: -44, y: -17, angle: -16, start: 0.07, end: 0.48 },
  { name: 'part-b', x: 35, y: 0, angle: 13, start: 0.18, end: 0.64 },
  { name: 'part-c', x: -27, y: 34, angle: -11, start: 0.29, end: 0.75 },
  { name: 'part-dot', x: 20, y: 39, angle: 0, start: 0.57, end: 0.88 },
]

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function ease(progress: number, start: number, end: number) {
  const value = clamp((progress - start) / (end - start))
  return value * value * (3 - 2 * value)
}

export function mountHeroScene(hero: HTMLElement) {
  const stageElement = hero.querySelector<HTMLElement>('.reel-stage')
  const counterElement = hero.querySelector('.reel-counter')
  const cueElement = hero.querySelector<HTMLButtonElement>('.reel-cue')
  const cueTextElement = hero.querySelector('.reel-cue-text')
  const cueArrowElement = hero.querySelector('.reel-cue-arrow')
  const workElement = hero.querySelector<HTMLAnchorElement>('.reel-work')
  const aboutElement = hero.querySelector<HTMLAnchorElement>('.reel-next')
  if (!stageElement || !counterElement || !cueElement || !cueTextElement || !cueArrowElement || !workElement || !aboutElement) return
  const [stage, counter, cue, cueText, cueArrow, work] = [
    stageElement, counterElement, cueElement, cueTextElement, cueArrowElement, workElement,
  ] as const

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const compact = matchMedia(compactLayout)
  let pendingFrame = 0
  let heroTop = 0
  let scrollLength = 1
  let currentPhase = 0
  let previousProgress = -1

  const set = (name: string, value: string | number) => {
    stage.style.setProperty('--' + name, String(value))
  }

  function draw() {
    pendingFrame = 0
    const reduce = reducedMotion.matches
    const isCompact = compact.matches
    const progress = reduce ? 0 : clamp((window.scrollY - heroTop) / scrollLength)
    if (progress === previousProgress) return
    previousProgress = progress

    const expansion = ease(progress, 0.17, 0.83)
    const fadeIntro = ease(progress, 0.29, 0.61)
    const revealStatement = ease(progress, 0.61, 0.9)
    const entryEdges = isCompact ? [42, 6, 13, 6] : [17, 7, 12, 51]
    const exitEdges = isCompact ? [16, 4, 11, 4] : [11, 3.5, 11, 3.5]

    entryEdges.forEach((edge, index) => {
      const offset = edge + (exitEdges[index] - edge) * expansion
      set('edge-' + index, offset.toFixed(2) + '%')
    })
    set('intro-opacity', 1 - fadeIntro)
    set('intro-offset', (isCompact ? -30 : -54) * fadeIntro + 'px')
    set('board-opacity', 1 - ease(progress, 0.55, 0.89))
    set('end-opacity', revealStatement)
    set('end-offset', (1 - revealStatement) * 18 + 'px')
    set('grid-alpha', 1 - revealStatement * 0.8)
    set('mark-x', isCompact ? '0%' : (expansion * 37).toFixed(2) + '%')
    set('mark-y', isCompact ? (expansion * 20).toFixed(2) + '%' : '0%')
    set('mark-size', (1 + expansion * (isCompact ? 0.07 : 0.27)).toFixed(3))
    set('reel-progress', progress.toFixed(3))

    for (const { name, x, y, angle, start, end } of pieces) {
      const remaining = reduce ? 0 : 1 - ease(progress, start, end)
      set(name, `translate(${x * remaining}px, ${y * remaining}px) rotate(${angle * remaining}deg)`)
    }
    set('dot-alpha', reduce ? 1 : 0.34 + revealStatement * 0.66)

    const phase = progress < 0.25 ? 0 : progress < 0.72 ? 1 : 2
    if (hero.dataset.phase !== String(phase)) {
      currentPhase = phase
      hero.dataset.phase = String(phase)
      counter.textContent = '0' + (phase + 1)
      cueText.textContent = stageLabels[phase]
      cueArrow.textContent = phase === 2 ? '↺' : '↓'
    }

    const workHidden = fadeIntro > 0.7
    if (work.inert !== workHidden) work.inert = workHidden
  }

  function queueDraw() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(draw)
  }

  function measure() {
    heroTop = window.scrollY + hero.getBoundingClientRect().top
    scrollLength = Math.max(1, hero.offsetHeight - stage.offsetHeight)
    previousProgress = -1
    queueDraw()
  }

  function jump() {
    if (reducedMotion.matches) return
    const destination = currentPhase === 2 ? heroTop : heroTop + scrollLength * 0.97
    window.scrollTo({ top: destination, behavior: 'smooth' })
  }

  function followHeroLink(event: MouseEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const link = event.currentTarget
    if (!(link instanceof HTMLAnchorElement)) return
    const hash = link.getAttribute('href')
    if (!hash?.startsWith('#')) return
    const target = document.getElementById(hash.slice(1))
    if (!target) return

    event.preventDefault()
    const nav = document.querySelector('.navbar, .preview-nav')
    const offset = nav?.getBoundingClientRect().height ?? 0
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - offset,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    })
  }

  hero.dataset.ready = 'true'
  const resize = new ResizeObserver(measure)
  resize.observe(hero)
  resize.observe(stage)
  measure()
  cue.addEventListener('click', jump)
  work.addEventListener('click', followHeroLink)
  aboutElement.addEventListener('click', followHeroLink)
  window.addEventListener('scroll', queueDraw, { passive: true })
  reducedMotion.addEventListener('change', measure)
  compact.addEventListener('change', measure)

  return () => {
    cancelAnimationFrame(pendingFrame)
    resize.disconnect()
    cue.removeEventListener('click', jump)
    work.removeEventListener('click', followHeroLink)
    aboutElement.removeEventListener('click', followHeroLink)
    window.removeEventListener('scroll', queueDraw)
    reducedMotion.removeEventListener('change', measure)
    compact.removeEventListener('change', measure)
    delete hero.dataset.ready
    delete hero.dataset.phase
    stage.removeAttribute('style')
    work.inert = false
  }
}
