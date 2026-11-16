import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture } from './helpers/responsive.mjs'
import { mobileLogoTransforms } from '../src/lib/journey/hero.mjs'

test('mobile logo uses cached HTML layers with the original path geometry', () => {
  const f = fixture(390, 844)
  try {
    for (const [index, name] of ['a', 'b', 'c'].entries()) {
      const original = f.doc.querySelector('.reel-piece-' + name + ' path').getAttribute('d')
      const mobile = f.doc.querySelectorAll('.reel-mobile-piece svg > path:first-child')[index].getAttribute('d')
      assert.equal(mobile, original)
    }
    const stage = f.doc.querySelector('.reel-stage'), styleBefore = stage.getAttribute('style')
    f.win.scrollTo({ top: 844 * .4 }); f.tick(2)
    assert.deepEqual([...f.doc.querySelectorAll('[data-logo-part]')].map(piece => piece.style.transform), mobileLogoTransforms(.4))
    assert.equal(stage.getAttribute('style'), styleBefore, 'Mobile scroll must not rewrite inherited SVG variables')
    assert.ok(!f.doc.querySelector('.reel-piece-b').hasAttribute('style'), 'The original SVG remains static on mobile')
    f.win.scrollTo({ top: 844 }); f.tick(2)
    assert.deepEqual([...f.doc.querySelectorAll('[data-logo-part]')].map(piece => piece.style.willChange), ['auto', 'auto', 'auto', 'auto'])
    f.win.scrollTo({ top: f.heroHeight() + 100 }); f.tick(2)
    f.win.scrollTo({ top: f.heroHeight() + 150 })
    assert.ok(f.pendingFrames() <= 1, 'Only the journey should request a frame after the hero is complete')
  } finally { f.close() }
})

test('iPhone resize bursts are coalesced and preserve a native project swipe', () => {
  const f = fixture(390, 844)
  try {
    f.app.goTo(3); f.tick(2)
    const viewport = f.doc.querySelector('.gallery-window'), card = f.doc.querySelectorAll('.gallery-track .project-card')[2]
    viewport.scrollLeft = card.offsetLeft; viewport.dispatchEvent(new f.win.Event('scroll'))
    const offset = viewport.scrollLeft
    for (let i = 0; i < 20; i++) f.win.dispatchEvent(new f.win.Event('resize'))
    assert.ok(f.pendingFrames() <= 2)
    f.tick(3)
    assert.equal(viewport.scrollLeft, offset)
    assert.equal(f.app.snapshot().projectIndex, 2)
    assert.equal(f.pendingFrames(), 0)
  } finally { f.close() }
})
