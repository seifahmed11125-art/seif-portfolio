import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { cameraAt, journeyAtOffset, stationOffset, galleryOffset, deckFrames, projectAspect, JourneyController } from '../src/lib/journey/journey-model.mjs'
import { heroFrame } from '../src/lib/journey/hero.mjs'

test('the camera follows the identical route in both directions', () => {
  for (let i = 0; i <= 400; i++) {
    const a = cameraAt(i / 100), b = cameraAt(4 - (400 - i) / 100)
    for (const key of ['x', 'y', 'z']) assert.ok(Math.abs(a[key] - b[key]) < 1e-10)
  }
})

test('every native-scroll stop lands on a readable chapter plateau', () => {
  for (const height of [640, 730, 1080]) for (let chapter = 1; chapter <= 4; chapter++) {
    const offset = stationOffset(chapter, height)
    assert.equal(journeyAtOffset(offset, height), chapter)
    assert.equal(journeyAtOffset(offset + height * .1, height), chapter)
  }
})

test('travel can reverse before the previous flight finishes', () => {
  const controller = new JourneyController(1, 8)
  controller.goTo(4)
  for (let i = 0; i < 10; i++) controller.advance(1 / 60)
  const before = controller.progress
  assert.ok(before > 1 && before < 4)
  controller.goTo(1)
  for (let i = 0; i < 30; i++) controller.advance(1 / 60)
  assert.ok(controller.progress < before)
})

test('gallery translation never exposes empty space before or after the cards', () => {
  for (const viewport of [280, 350, 922, 1400]) {
    const widths = [Math.min(350, viewport), Math.min(350, viewport), 190, 190]
    const total = widths.reduce((a, b) => a + b, 0) + 60
    let left = 0
    widths.forEach((width, i) => {
      const offset = galleryOffset(viewport, total, left, width)
      assert.ok(offset <= 0 && offset >= Math.min(0, viewport - total))
      if (i === 0) assert.equal(offset, 0)
      if (i === widths.length - 1) assert.equal(offset, Math.min(0, viewport - total))
      left += width + 20
    })
  }
})

test('a service-card shuffle moves separate faces without spinning them over', () => {
  for (const direction of [-1, 1]) {
    const frames = deckFrames(direction)
    assert.ok(frames.outgoing[1].transform.includes('%'))
    assert.notDeepEqual(frames.outgoing, frames.incoming)
    assert.ok(![...frames.outgoing, ...frames.incoming].some(f => /180deg|360deg/.test(f.transform)))
  }
})

test('AI videos stay landscape while design covers stay portrait', () => {
  assert.equal(projectAspect({ category: 'AI Videos' }), '16 / 9')
  for (const category of ['Brand Identity', 'Social Media Designs', 'Motion Graphics', 'Print Designs', 'Presentation Designs']) assert.equal(projectAspect({ category }), '4 / 5')
})

test('the original hero has distinct introduction, assembly and final phases', () => {
  for (const compact of [false, true]) {
    assert.equal(heroFrame(0, compact).phase, 0)
    assert.equal(heroFrame(.5, compact).phase, 1)
    const final = heroFrame(1, compact)
    assert.equal(final.phase, 2)
    assert.equal(final.vars['intro-opacity'], 0)
    assert.equal(final.vars['end-opacity'], 1)
    assert.equal(final.vars['part-a'], 'translate(0px, 0px) rotate(0deg)')
  }
})

test('social destinations use the direct original profile URLs', () => {
  const copy = JSON.parse(fs.readFileSync(new URL('../src/lib/journey/copy.json', import.meta.url)))
  assert.equal(copy.socials.find(s => s.name === 'Instagram').url, 'https://www.instagram.com/seif_eldin0/')
  assert.equal(copy.socials.find(s => s.name === 'LinkedIn').url, 'https://www.linkedin.com/in/seif-ahmed-a62b3a212/')
})
