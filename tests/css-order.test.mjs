import test from 'node:test'
import assert from 'node:assert/strict'
import { fixture, effectiveStyle, sourceStyles } from './helpers/responsive.mjs'

for (const [width, height] of [[320, 480], [390, 844], [430, 932], [844, 390], [932, 430]]) test(`mobile styles win after any route stylesheet insertion at ${width} × ${height}`, () => {
  const f = fixture(width, height), dimensions = { width, height, coarse: true }
  try {
    const orders = [[0, 1, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0]]
    for (const order of orders) {
      const css = selector => effectiveStyle(f.doc.querySelector(selector), dimensions, order.map(index => sourceStyles[index]))
      assert.equal(css('.reel-intro').position, 'relative')
      assert.equal(css('.reel-media').position, 'relative')
      assert.equal(css('.reel-mark').position, 'relative')
      for (const side of ['top', 'right', 'bottom', 'left']) assert.equal(css('.reel-intro')[side], 'auto')
      assert.equal(css('.reel-stage')['min-height'], '0')
      assert.ok(!css('#home-title')['font-size'].includes('4.2rem'))
      assert.equal(css('.services-layout')['grid-template-columns'], 'minmax(0, 1fr)')
      assert.equal(css('.scene-content').bottom, 'auto')
      assert.equal(css('.gallery-window')['overflow-x'], 'auto')
      assert.equal(css('.journey-shell').position, 'sticky')
      assert.equal(css('.reel-media')['grid-area'], width > height && height <= 560 ? '1 / 2' : '2 / 1')
    }
  } finally { f.close() }
})

test('all mobile chapters use one vertical baseline so a short chapter does not jump into the middle', () => {
  const f = fixture(390, 844)
  try { assert.equal(new Set(f.timeline().chapters.map(chapter => chapter.top)).size, 1) } finally { f.close() }
})
