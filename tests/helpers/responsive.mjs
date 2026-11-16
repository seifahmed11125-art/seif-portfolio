import fs from 'node:fs'
import { createRequire } from 'node:module'
import { JSDOM } from 'jsdom'
import postcss from 'postcss'
import { mountApp } from '../../src/lib/journey/runtime.mjs'
import { MOBILE_LAYOUT_QUERY } from '../../src/lib/journey/responsive.mjs'
import { createMobileTimeline } from '../../src/lib/journey/mobile-journey.mjs'
const require = createRequire(import.meta.url), React = require('react')
const { renderToStaticMarkup } = require('react-dom/server'), { component } = require('../components.cjs')
export const copy = JSON.parse(fs.readFileSync(new URL('../../src/lib/journey/copy.json', import.meta.url)))
const project = i => ({ id: 'project-' + i, title: 'Project ' + i, category: i < 2 ? 'AI Videos' : 'Brand Identity', cover: 'https://example.com/cover.webp', video_url: i < 2 ? 'https://example.com/' + i + '.mp4' : null, external_link: 'https://www.behance.net/gallery/' + i, description: 'Project details' })
export const data = { ...copy, projects: Array.from({ length: 4 }, (_, i) => project(i)) }

export function matchesQuery(query, { width, height, coarse = true, reduced = false }) {
  return query.split(',').some(part => [...part.matchAll(/\(([^:()]+):\s*([^()]+)\)/g)].every(([, feature, value]) => {
    feature = feature.trim(); value = value.trim()
    if (feature === 'max-width') return width <= parseFloat(value)
    if (feature === 'min-width') return width >= parseFloat(value)
    if (feature === 'max-height') return height <= parseFloat(value)
    if (feature === 'min-height') return height >= parseFloat(value)
    if (feature === 'pointer') return value === (coarse ? 'coarse' : 'fine')
    if (feature === 'orientation') return value === (width > height ? 'landscape' : 'portrait')
    if (feature === 'prefers-reduced-motion') return reduced === (value === 'reduce')
    return false
  }))
}

// Geometry is supplied to test runtime behavior, not to claim browser layout QA.
export function fixture(width, height, { coarse = true, reduced = false, page = 'home' } = {}) {
  const dom = new JSDOM(renderToStaticMarkup(React.createElement(component('PortfolioShell'), { data, page })), { url: 'https://portfolio.test/' + (page === 'home' ? '' : 'projects'), pretendToBeVisual: true })
  const win = dom.window, doc = win.document, media = new Map(), raf = new Map(), paints = { count: 0 }
  let dimensions = { width, height, coarse, reduced }, scrollY = 0, sequence = 0, now = 0
  Object.defineProperties(win, { innerWidth: { get: () => dimensions.width }, innerHeight: { get: () => dimensions.height }, scrollY: { get: () => scrollY } })
  win.matchMedia = query => {
    if (!media.has(query)) {
      const listeners = new Set()
      media.set(query, { get matches() { return matchesQuery(query, dimensions) }, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn), listeners })
    }
    return media.get(query)
  }
  const mobile = () => win.matchMedia(MOBILE_LAYOUT_QUERY).matches
  const heroHeight = () => dimensions.height * (reduced ? 1 : mobile() ? 2 : 1.9)
  const contentHeights = [800, 840, 760, 650]
  const timeline = () => createMobileTimeline(contentHeights, dimensions.height, 68, 64)
  const targets = () => [0, ...timeline().chapters.map(chapter => heroHeight() + chapter.anchor)]
  const offsets = () => [0, heroHeight(), heroHeight() + 800, heroHeight() + 1640, heroHeight() + 2400]
  const gutter = () => Math.max(20, Math.min(40, dimensions.width * .05))
  const viewWidth = () => dimensions.width - gutter() * 2
  win.scrollTo = ({ top }) => { scrollY = Math.max(0, top); win.dispatchEvent(new win.Event('scroll')) }
  win.HTMLElement.prototype.scrollTo = function ({ left }) { this.scrollLeft = left; this.dispatchEvent(new win.Event('scroll')) }
  Object.defineProperties(win.HTMLElement.prototype, {
    clientWidth: { get() { return this.classList.contains('gallery-window') ? viewWidth() : dimensions.width } },
    clientHeight: { get() { return mobile() && doc.querySelector('.portfolio-experience').dataset.mobileMotion !== 'true' && this.classList.contains('journey-shell') ? 3100 : dimensions.height } },
    offsetHeight: { get() {
      if (this.id === 'home') return heroHeight()
      if (this.classList.contains('site-header')) return 68
      if (this.classList.contains('journey-controls')) return 64
      if (this.classList.contains('scene-content')) return contentHeights[Number(this.closest('.station').dataset.index) - 1]
      if (this.classList.contains('journey-scroll')) return doc.querySelector('.portfolio-experience').dataset.mobileMotion === 'true' ? parseFloat(doc.querySelector('.portfolio-experience').style.getPropertyValue('--mobile-travel-height')) || 3100 : mobile() ? 3100 : dimensions.height * 4.9
      return dimensions.height
    } },
    offsetWidth: { get() { return this.classList.contains('project-card--video') ? Math.min(viewWidth(), 580) : Math.min(dimensions.width * .76, 320) } },
    offsetLeft: { get() { let left = 0, node = this.previousElementSibling; while (node) { left += node.offsetWidth + 18; node = node.previousElementSibling } return left } },
  })
  win.HTMLElement.prototype.getBoundingClientRect = function () {
    const index = Number(this.dataset.index), station = this.classList.contains('station')
    let top = this.id === 'home' ? 0 : this.classList.contains('journey-scroll') ? heroHeight() : station ? offsets()[index] : 0
    if (mobile() && station && this.style.transform && this.style.transform !== 'none') top += 1000
    return { top: top - scrollY, left: 0, width: dimensions.width, height: this.offsetHeight, bottom: top - scrollY + this.offsetHeight, right: dimensions.width }
  }
  win.requestAnimationFrame = fn => { raf.set(++sequence, fn); return sequence }
  win.cancelAnimationFrame = id => raf.delete(id)
  win.HTMLCanvasElement.prototype.getContext = () => ({ setTransform() {}, clearRect() { paints.count++ }, fillRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {} })
  win.HTMLMediaElement.prototype.play = function () { this.playing = true; this.dispatchEvent(new win.Event('play')); return Promise.resolve() }
  win.HTMLMediaElement.prototype.pause = function () { this.playing = false }
  win.HTMLMediaElement.prototype.load = function () {}
  win.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  win.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new win.Event('close')) }
  const app = mountApp(doc, win, data)
  return { dom, win, doc, app, paints, offsets, targets, timeline, heroHeight, contentHeights, pendingFrames: () => raf.size,
    tick(frames = 200) { for (let i = 0; i < frames; i++) { now += 1000 / 60; const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(fn => fn(now)) } },
    setViewport(width, height, coarse = true) { dimensions = { ...dimensions, width, height, coarse }; win.dispatchEvent(new win.Event('resize')); media.forEach(value => value.listeners.forEach(fn => fn())); this.tick(3) },
    close() { app.destroy(); win.close() },
  }
}

export const sourceStyles = ['journey.css', 'journey-hero.css', 'journey-mobile.css'].map(file => postcss.parse(fs.readFileSync(new URL('../../src/styles/' + file, import.meta.url))))

function specificity(selector) {
  let score = 0, rest = selector
  while (rest) {
    const attribute = rest.match(/^\[(?:[^\]"']|"[^"]*"|'[^']*')*\]/)
    const name = rest.match(/^[\w-]+/)
    if (attribute) { score += 100; rest = rest.slice(attribute[0].length) }
    else if (/^[.#]/.test(rest)) { const token = rest.match(/^[.#][\w-]+/); if (!token) break; score += rest[0] === '#' ? 10000 : 100; rest = rest.slice(token[0].length) }
    else if (rest.startsWith(':')) {
      const token = rest.match(/^:{1,2}[\w-]+/); if (!token) break
      const pseudo = token[0]; rest = rest.slice(pseudo.length)
      if (rest[0] === '(') {
        let depth = 1, end = 1
        for (; end < rest.length && depth; end++) { if (rest[end] === '(') depth++; if (rest[end] === ')') depth-- }
        const inner = rest.slice(1, end - 1); rest = rest.slice(end)
        if ([':is', ':not', ':has'].includes(pseudo)) score += Math.max(...postcss.list.comma(inner).map(specificity))
        else if (pseudo !== ':where') score += 100
      } else score += pseudo.startsWith('::') ? 1 : 100
    } else if (name) { score++; rest = rest.slice(name[0].length) }
    else rest = rest.slice(1)
  }
  return score
}

function declarations(node) {
  const values = [[node.prop, node.value]]
  if (['inset', 'padding', 'margin'].includes(node.prop)) {
    const parts = postcss.list.space(node.value), sides = [parts[0], parts[1] ?? parts[0], parts[2] ?? parts[0], parts[3] ?? parts[1] ?? parts[0]]
    for (const [index, side] of ['top', 'right', 'bottom', 'left'].entries()) values.push([node.prop === 'inset' ? side : node.prop + '-' + side, sides[index]])
  }
  if (node.prop === 'overflow') { const parts = postcss.list.space(node.value); values.push(['overflow-x', parts[0]], ['overflow-y', parts[1] ?? parts[0]]) }
  if (node.prop === 'font') {
    const size = postcss.list.space(node.value).find(value => /^(?:[\d.]+(?:px|rem|em|vw)|clamp\(|min\(|max\(|calc\()/.test(value))
    if (size) values.push(['font-size', size.split('/')[0]])
  }
  return values
}

// Check responsive cascade contracts against the real selectors and markup.
// This deliberately does not simulate font measurement, painting or pixel layout.
export function effectiveStyle(element, dimensions, sheets = sourceStyles) {
  const result = {}, priorities = {}
  for (const sheet of sheets) sheet.walkRules(rule => {
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && parent.name === 'media' && !matchesQuery(parent.params, dimensions)) return
      if (parent.type === 'atrule' && parent.name.includes('keyframes')) return
    }
    const matching = rule.selectors.filter(selector => { try { return element.matches(selector) } catch { return false } })
    if (!matching.length) return
    const weight = Math.max(...matching.map(specificity))
    rule.nodes.forEach(node => {
      if (node.type !== 'decl') return
      const priority = weight + (node.important ? 1000000 : 0)
      for (const [property, value] of declarations(node)) if (priority >= (priorities[property] ?? -1)) { result[property] = value; priorities[property] = priority }
    })
  })
  return result
}
