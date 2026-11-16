import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture, effectiveStyle, matchesQuery, data } from './helpers/responsive.mjs'
import { MOBILE_LAYOUT_QUERY, nativeGalleryIndex, nativeGalleryOffset } from '../src/lib/journey/responsive.mjs'

const screens = [[320, 480], [360, 640], [375, 667], [390, 844], [430, 932], [600, 960], [768, 1024], [820, 1180], [1024, 1366], [667, 375], [844, 390], [932, 430]]

for (const [width, height] of screens) test(`mobile document flow and navigation at ${width} × ${height}`, () => {
  const f = fixture(width, height)
  try {
    assert.equal(f.app.snapshot().layout, 'mobile')
    for (let index = 1; index <= 4; index++) {
      f.doc.querySelector('.site-header [data-station="' + index + '"]').click()
      assert.equal(f.win.scrollY, f.offsets()[index] - 80, 'Navigation must use the actual section position and header clearance')
      assert.equal(f.app.snapshot().station, index)
      assert.equal(f.doc.querySelector('.site-header [aria-current=page]').dataset.station, String(index))
    }
    for (const station of f.doc.querySelectorAll('.station')) {
      assert.equal(station.inert, false)
      assert.equal(station.getAttribute('aria-hidden'), 'false')
      assert.equal(station.style.transform, 'none')
    }
    f.tick()
    assert.equal(f.paints.count, 0, 'The full-screen journey canvas must stay idle on mobile')
    assert.equal(f.pendingFrames(), 0)
    f.doc.querySelector('.brand').click()
    assert.equal(f.win.scrollY, 0); assert.equal(f.app.snapshot().station, 0)
    const dimensions = { width, height, coarse: true }
    const css = selector => effectiveStyle(f.doc.querySelector(selector), dimensions)
    assert.equal(css('.journey-scroll').height, 'auto')
    assert.equal(css('.journey-shell').position, 'relative')
    assert.equal(css('.journey-shell').height, 'auto')
    assert.equal(css('.station').position, 'relative')
    assert.equal(css('.about-copy').height, 'auto')
    assert.equal(css('.about-copy').overflow, 'visible')
    assert.equal(css('.services-layout').overflow, 'visible')
    assert.equal(css('.gallery-window')['overflow-x'], 'auto')
    assert.ok(css('.gallery-window')['touch-action'].includes('pan-y'))
    assert.equal(css('.world').display, 'none')
    assert.equal(css('.reel-stage')['min-height'], '0')
    assert.equal(css('.dialog-layout')['flex-direction'], 'column')
  } finally { f.close() }
})

test('native mobile swiping and arrow controls agree on the selected project', () => {
  const f = fixture(390, 844)
  try {
    f.app.goTo(3)
    const viewport = f.doc.querySelector('.gallery-window'), track = f.doc.querySelector('.gallery-track')
    const cards = [...track.children]
    f.doc.querySelector('.gallery-next').click()
    assert.equal(viewport.scrollLeft, cards[1].offsetLeft)
    assert.equal(f.app.snapshot().projectIndex, 1)
    viewport.scrollLeft = cards[2].offsetLeft; viewport.dispatchEvent(new f.win.Event('scroll'))
    assert.equal(f.app.snapshot().projectIndex, 2)
    assert.equal(f.doc.querySelector('.gallery-count').textContent, '03 / 04')
    assert.equal(track.style.transform, 'none')
    const gesture = new f.win.MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 240, button: 0 })
    cards[2].dispatchEvent(gesture)
    f.win.dispatchEvent(new f.win.MouseEvent('pointermove', { clientX: 80, cancelable: true }))
    assert.equal(gesture.defaultPrevented, false)
    assert.equal(track.classList.contains('is-dragging'), false)
    f.app.updateFilter('AI Videos')
    assert.equal(viewport.scrollLeft, 0)
    assert.equal(f.app.snapshot().projectIndex, 0)
    f.doc.querySelector('[data-play-video]').click()
    const video = f.doc.querySelector('video[data-inline-player]')
    assert.equal(video.playing, true)
    f.app.goTo(4)
    assert.equal(video.playing, false)
  } finally { f.close() }
})

test('resizing between desktop, portrait and landscape retains navigation and reachable content', () => {
  const f = fixture(1440, 900, { coarse: false })
  try {
    f.app.goTo(3); f.tick()
    assert.equal(f.app.snapshot().station, 3)
    f.setViewport(390, 844)
    assert.equal(f.app.snapshot().layout, 'mobile'); assert.equal(f.app.snapshot().station, 3)
    assert.equal(f.win.scrollY, f.offsets()[3] - 80)
    f.setViewport(844, 390)
    assert.equal(f.app.snapshot().station, 3)
    assert.equal(f.doc.querySelector('.station').style.transform, 'none')
    f.setViewport(1440, 900, false); f.tick()
    assert.equal(f.app.snapshot().layout, 'desktop'); assert.equal(f.app.snapshot().station, 3)
    assert.equal(f.doc.querySelectorAll('.station[aria-hidden=false]').length, 1)
    assert.ok(f.doc.querySelector('.work-station').style.transform.includes('translate3d'))
    const css = effectiveStyle(f.doc.querySelector('.journey-shell'), { width: 1440, height: 900, coarse: false })
    assert.equal(css.position, 'sticky'); assert.equal(css.height, '100svh')
  } finally { f.close() }
})

test('tablet arrows can select the last card when the final two cards fit together', () => {
  const f = fixture(1024, 1366)
  try {
    f.app.goTo(3)
    for (let index = 1; index <= 3; index++) {
      f.doc.querySelector('.gallery-next').click()
      assert.equal(f.app.snapshot().projectIndex, index)
    }
    assert.equal(f.doc.querySelector('.gallery-count').textContent, '04 / 04')
    assert.equal(f.doc.querySelector('.gallery-next').disabled, true)
    f.doc.querySelector('.gallery-prev').click()
    assert.equal(f.app.snapshot().projectIndex, 2)
  } finally { f.close() }
})

for (const width of [375, 820]) test(`mobile All Projects keeps category filters and first-click video playback at ${width}px`, () => {
  const f = fixture(width, 900, { page: 'projects' })
  try {
    f.doc.querySelector('[data-category="AI Videos"]').click()
    assert.equal(f.doc.querySelectorAll('.project-card').length, 2)
    assert.equal(f.doc.querySelectorAll('video[src]').length, 0)
    f.doc.querySelector('[data-play-video]').click()
    assert.equal(f.doc.querySelector('video').playing, true)
    assert.equal(f.doc.querySelector('.project-dialog').open, false)
    f.app.updateFilter('Brand Identity')
    f.doc.querySelector('[data-open-project]').click()
    assert.equal(f.doc.querySelector('.project-dialog').open, true)
    assert.equal(f.doc.documentElement.style.overflow, 'hidden')
    f.app.closeProject()
    assert.equal(f.doc.documentElement.style.overflow, '')
    const styles = effectiveStyle(f.doc.querySelector('.all-project-grid'), { width, height: 900, coarse: true })
    assert.equal(styles['grid-template-columns'], width < 700 ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))')
  } finally { f.close() }
})

test('touch tablets and landscape phones select mobile flow while desktop keeps its journey', () => {
  assert.equal(matchesQuery(MOBILE_LAYOUT_QUERY, { width: 1024, height: 1366, coarse: true }), true)
  assert.equal(matchesQuery(MOBILE_LAYOUT_QUERY, { width: 1024, height: 768, coarse: false }), false)
  assert.equal(matchesQuery(MOBILE_LAYOUT_QUERY, { width: 932, height: 430, coarse: true }), true)
})

test('native gallery bounds and selection do not expose an empty end of the strip', () => {
  const cards = data.projects.map((_, index) => ({ offsetLeft: index * 310 }))
  for (const width of [280, 350, 700]) for (let index = 0; index < cards.length; index++) {
    const offset = nativeGalleryOffset(cards[index].offsetLeft, width, 1230)
    assert.ok(offset >= 0 && offset <= 1230 - width)
    assert.equal(nativeGalleryIndex(offset, width, 1230, cards, index), index)
  }
})
