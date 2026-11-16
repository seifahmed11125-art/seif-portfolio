import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { setImmediate } from 'node:timers/promises'
import { JSDOM } from 'jsdom'
import { createServiceDeck } from '../src/lib/journey/service-deck.mjs'
import { servicePose } from '../src/lib/journey/journey-model.mjs'

const { services } = JSON.parse(fs.readFileSync(new URL('../src/lib/journey/copy.json', import.meta.url)))

function fixture(reduced = false) {
  const dom = new JSDOM('<div class="service-deck"></div>')
  const element = dom.window.document.querySelector('.service-deck'), animations = [], selections = []
  dom.window.Element.prototype.animate = function (frames, options) {
    let resolve, reject
    const animation = { element: this, frames, options,
      finished: new Promise((yes, no) => { resolve = yes; reject = no }),
      resolve: () => resolve(), cancel: () => reject(new Error('Cancelled')) }
    animations.push(animation)
    return animation
  }
  const deck = createServiceDeck(element, services, { reduced, onSelect: index => selections.push(index) })
  const originals = [...element.children], text = originals.map(card => card.textContent)
  function assertIdentity() {
    assert.equal(element.children.length, services.length)
    originals.forEach((card, index) => {
      assert.ok(element.contains(card), 'Every original card must remain in the deck')
      assert.equal(card.dataset.serviceId, String(index))
      assert.equal(card.textContent, text[index], 'A moving card must never change its content')
    })
  }
  async function finish() {
    for (let i = 0; deck.snapshot().running && i < 10; i++) {
      animations.forEach(animation => animation.resolve())
      await setImmediate()
    }
    assert.equal(deck.snapshot().running, false, 'Queued selections must settle')
    assert.equal(element.hasAttribute('aria-busy'), false)
  }
  return { deck, element, originals, animations, selections, assertIdentity, finish,
    close() { deck.destroy(); dom.window.close() } }
}

test('forward turns promote the exact card visible underneath, including last-to-first wrap', async () => {
  const f = fixture()
  try {
    for (let index = 1; index <= services.length; index++) {
      const underneath = f.element.querySelector('.service-under')
      const operation = f.deck.move(1)
      f.assertIdentity()
      await f.finish(); await operation
      assert.equal(f.element.querySelector('.service-current'), underneath)
      assert.equal(underneath, f.originals[index % services.length])
      assert.equal(f.element.querySelectorAll('[aria-hidden="false"]').length, 1)
      f.assertIdentity()
    }
    assert.equal(f.element.querySelector('.service-current'), f.originals[0])
  } finally { f.close() }
})

test('backward turns retrieve the same last card from behind and only travel to the right', async () => {
  const f = fixture()
  try {
    for (let step = 1; step <= services.length; step++) {
      const rear = f.element.lastElementChild, offset = f.animations.length
      const operation = f.deck.move(-1)
      const incoming = f.animations.slice(offset).find(animation => animation.element === rear)
      assert.equal(incoming.frames[0].transform, servicePose(services.length - 1))
      assert.ok(incoming.frames[1].transform.includes('106%'))
      for (const animation of f.animations.slice(offset)) for (const frame of animation.frames) {
        assert.ok(Number.parseFloat(frame.transform.match(/translate3d\(([^,]+)/)[1]) >= 0)
      }
      f.assertIdentity()
      await f.finish(); await operation
      assert.equal(f.element.querySelector('.service-current'), rear)
      assert.equal(rear, f.originals[(services.length - step) % services.length])
      f.assertIdentity()
    }
  } finally { f.close() }
})

test('selecting a specialty brings its existing card forward without replacing visible cards', async () => {
  const f = fixture()
  try {
    for (const index of [4, 2, 5, 0]) {
      const operation = f.deck.select(index)
      f.assertIdentity()
      await f.finish(); await operation
      assert.equal(f.element.firstElementChild, f.originals[index])
      f.assertIdentity()
    }
  } finally { f.close() }
})

test('rapid next, previous and tab selections settle on the latest request', async () => {
  const f = fixture()
  try {
    f.deck.move(1); f.deck.move(1); f.deck.move(1); f.deck.move(-1)
    assert.equal(f.deck.snapshot().target, 2)
    f.assertIdentity()
    await f.finish()
    assert.equal(f.element.firstElementChild, f.originals[2])
    f.deck.select(5); f.deck.move(1); f.deck.move(-1); f.deck.select(3)
    assert.equal(f.deck.snapshot().target, 3)
    await f.finish()
    assert.equal(f.element.firstElementChild, f.originals[3])
    assert.equal(f.selections.at(-1), 3)
    f.assertIdentity()
  } finally { f.close() }
})

test('returning to the current card during a flip does not strand the deck', async () => {
  const f = fixture()
  try {
    f.deck.move(1); f.deck.move(-1)
    await f.finish()
    assert.equal(f.deck.snapshot().current, 0)
    assert.equal(f.element.firstElementChild, f.originals[0])
    f.assertIdentity()
  } finally { f.close() }
})

test('reduced motion keeps the same ordering without starting animations', async () => {
  const f = fixture(true)
  try {
    await f.deck.move(-1)
    assert.equal(f.element.firstElementChild, f.originals.at(-1))
    await f.deck.move(1)
    assert.equal(f.element.firstElementChild, f.originals[0])
    assert.equal(f.animations.length, 0)
    f.assertIdentity()
  } finally { f.close() }
})

test('unmounting cancels an active turn and clears the busy state', async () => {
  const f = fixture()
  try {
    const operation = f.deck.move(1)
    f.deck.destroy()
    await operation
    assert.equal(f.deck.snapshot().running, false)
    assert.equal(f.element.hasAttribute('aria-busy'), false)
    assert.equal(f.element.firstElementChild, f.originals[0])
    await f.deck.move(1)
    assert.equal(f.animations.length, services.length)
  } finally { f.close() }
})
