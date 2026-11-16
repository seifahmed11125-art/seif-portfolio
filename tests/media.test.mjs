import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { JSDOM } from 'jsdom'
import { createInlinePlayers, createVideoMarkup } from '../src/lib/journey/inline-video.mjs'
import { mountApp } from '../src/lib/journey/runtime.mjs'
const require = createRequire(import.meta.url)
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
const { component } = require('./components.cjs')
const copy = JSON.parse(fs.readFileSync(new URL('../src/lib/journey/copy.json', import.meta.url)))
const videos = [0, 1].map(i => ({ id: 'video-' + i, title: 'AI Video ' + i, category: 'AI Videos', cover: 'https://example.com/cover.jpg', video_url: `https://example.com/${i}.mp4`, external_link: `https://www.behance.net/gallery/${i}/Project`, description: '' }))
const data = { ...copy, projects: [...videos, { ...videos[0], id: 'design', title: 'Design', category: 'Brand Identity', video_url: null }] }

function fixture(page = 'projects') {
  const html = renderToStaticMarkup(React.createElement(component('PortfolioShell'), { data, page }))
  const dom = new JSDOM(html, { url: 'https://portfolio.test/' + (page === 'home' ? '' : 'projects'), pretendToBeVisual: true })
  const win = dom.window, doc = win.document, calls = [], state = new WeakMap()
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  win.requestAnimationFrame = () => 1; win.cancelAnimationFrame = () => {}
  win.HTMLCanvasElement.prototype.getContext = () => null
  win.HTMLMediaElement.prototype.play = function () { calls.push(this); state.set(this, 'playing'); this.dispatchEvent(new win.Event('play')); return Promise.resolve() }
  win.HTMLMediaElement.prototype.pause = function () { state.set(this, 'paused') }
  win.HTMLMediaElement.prototype.load = function () {}
  win.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  win.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  const app = mountApp(doc, win, data)
  return { doc, win, app, calls, state, close() { app.destroy(); win.close() } }
}

for (const page of ['home', 'projects']) test(`AI playback starts on the first click inside its card on ${page}`, async () => {
  const f = fixture(page)
  try {
    const button = f.doc.querySelector('[data-play-video]'), container = button.closest('[data-video-project]')
    const video = container.querySelector('video')
    assert.equal(video.hasAttribute('src'), false)
    assert.equal(video.preload, 'none')
    assert.equal(video.hidden, true)
    button.click()
    assert.equal(f.calls.length, 1, 'play must run during the click, without a second action')
    assert.equal(f.calls[0], video)
    assert.equal(video.hidden, false); assert.equal(video.controls, true); assert.equal(video.playsInline, true)
    assert.equal(video.src, videos[0].video_url)
    assert.equal(f.doc.querySelector('.project-dialog').open, false)
    assert.equal(container.closest('.project-card').querySelector('.project-external').href, videos[0].external_link)
    await Promise.resolve()
  } finally { f.close() }
})

test('native video controls also pause the other player', () => {
  const f = fixture()
  try {
    const buttons = [...f.doc.querySelectorAll('[data-play-video]')]
    buttons[0].click(); buttons[1].click()
    const players = [...f.doc.querySelectorAll('video[data-inline-player]')]
    assert.equal(f.state.get(players[0]), 'paused'); assert.equal(f.state.get(players[1]), 'playing')
    players[0].play()
    assert.equal(f.state.get(players[1]), 'paused')
  } finally { f.close() }
})

test('changing category releases playback and retains a separate Behance link', () => {
  const f = fixture()
  try {
    f.doc.querySelector('[data-play-video]').click()
    const previous = f.doc.querySelector('video[data-inline-player]')
    f.app.updateFilter('Brand Identity')
    assert.equal(f.state.get(previous), 'paused'); assert.equal(previous.hasAttribute('src'), false)
    f.app.updateFilter('AI Videos')
    const anchor = f.doc.querySelector('.project-external')
    const click = new f.win.MouseEvent('click', { bubbles: true, cancelable: true })
    anchor.dispatchEvent(click)
    assert.equal(click.defaultPrevented, false)
    assert.equal(anchor.target, '_blank')
    f.doc.querySelector('[data-play-video]').click()
    assert.equal(f.calls.length, 2)
    assert.equal(f.doc.querySelector('.project-dialog').open, false)
  } finally { f.close() }
})

test('a failed play attempt can be retried within the same card', async () => {
  const dom = new JSDOM('<main></main>'), doc = dom.window.document, root = doc.querySelector('main')
  dom.window.HTMLMediaElement.prototype.pause = function () {}
  dom.window.HTMLMediaElement.prototype.load = function () {}
  const container = createVideoMarkup(doc, videos[0]); root.append(container)
  const video = container.querySelector('video'), controls = createInlinePlayers(root)
  try {
    video.play = () => Promise.reject(new Error('Network failure'))
    assert.equal(await controls.play(container, videos[0].video_url), false)
    assert.equal(container.querySelector('[data-play-video]').hidden, false)
    assert.equal(container.querySelector('.inline-video-error').hidden, false)
    video.play = () => Promise.resolve()
    assert.equal(await controls.play(container, videos[0].video_url), true)
    assert.equal(container.querySelector('.inline-video-error').hidden, true)
    assert.equal(video.hidden, false)
  } finally { controls.destroy(); dom.window.close() }
})

test('the restored intro is present in initial home markup and the branding is consistent', () => {
  const home = new JSDOM(renderToStaticMarkup(React.createElement(component('PortfolioShell'), { data })))
  const doc = home.window.document
  assert.equal(doc.querySelectorAll('.logo-intro').length, 1)
  assert.equal(doc.querySelector('.logo-intro img').getAttribute('src'), '/journey/logo.webp')
  assert.equal(doc.querySelector('.reel-role').textContent.trim(), 'DESIGN & VISUALS')
  assert.equal(doc.querySelector('.brand small').textContent, 'DESIGN & VISUALS')
  home.window.close()
})
