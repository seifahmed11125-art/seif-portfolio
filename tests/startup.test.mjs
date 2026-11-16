import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fixture, data } from './helpers/responsive.mjs'
const require = createRequire(import.meta.url), React = require('react')
const { component } = require('./components.cjs')

test('first mobile interaction is ready before fonts finish downloading', async () => {
  const f = fixture(390, 844)
  f.app.destroy()
  f.doc.querySelector('.logo-intro').remove()
  delete f.doc.querySelector('.portfolio-experience').dataset.mobileMotion
  const previous = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT }
  globalThis.window = f.win; globalThis.document = f.doc; globalThis.IS_REACT_ACT_ENVIRONMENT = true
  let finishFonts, fontsFinished = false, sequence = 0
  const fontGate = new Promise(resolve => { finishFonts = () => { fontsFinished = true; resolve() } })
  Object.defineProperty(f.doc, 'fonts', { configurable: true, value: { ready: fontGate } })
  const timers = new Map()
  f.win.setTimeout = (fn, delay) => { timers.set(++sequence, { fn, delay }); return sequence }
  f.win.clearTimeout = id => timers.delete(id)
  const target = f.doc.createElement('div'); f.doc.querySelector('.portfolio-experience').append(target)
  const { createRoot } = require('react-dom/client'), { act } = React, root = createRoot(target)
  try {
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(component('MotionRuntime'), { data, intro: true }))))
    assert.equal(fontsFinished, false)
    assert.equal(f.doc.querySelector('.portfolio-experience').dataset.mobileMotion, 'true', 'The runtime must mount while the font request is pending')
    const minimum = [...timers.entries()].find(([, timer]) => timer.delay === 1350)
    assert.ok(minimum)
    await act(async () => { timers.delete(minimum[0]); minimum[1].fn() })
    assert.equal(f.doc.querySelector('.logo-intro').dataset.exiting, 'true', 'The logo exit must not wait for fonts.ready')
    f.doc.querySelector('.site-header [data-station="2"]').click(); f.tick(2)
    assert.equal(f.doc.querySelector('.site-header [aria-current=page]').dataset.station, '2')
    await act(async () => finishFonts())
    assert.equal(fontsFinished, true)
    assert.equal(f.doc.querySelector('.site-header [aria-current=page]').dataset.station, '2')
  } finally {
    finishFonts()
    await act(async () => root.unmount())
    f.close()
    globalThis.window = previous.window; globalThis.document = previous.document; globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act
  }
})
