import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { JSDOM } from 'jsdom'
const require = createRequire(import.meta.url), React = require('react')
const { component } = require('./components.cjs')

for (const reduced of [false, true]) test(`logo intro completes once and releases scrolling (reduced motion: ${reduced})`, async () => {
  const dom = new JSDOM('<div id="test-root"></div>', { pretendToBeVisual: true })
  const oldWindow = globalThis.window, oldDocument = globalThis.document, oldAct = globalThis.IS_REACT_ACT_ENVIRONMENT
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const timers = new Map(); let sequence = 0, completed = 0
  dom.window.matchMedia = () => ({ matches: reduced })
  dom.window.setTimeout = (fn, delay) => { timers.set(++sequence, { fn, delay }); return sequence }
  dom.window.clearTimeout = id => timers.delete(id)
  const { createRoot } = require('react-dom/client'), { act } = React
  const root = createRoot(document.querySelector('#test-root'))
  document.documentElement.style.overflow = 'scroll'
  try {
    await act(async () => root.render(React.createElement(React.StrictMode, null,
      React.createElement(component('LogoIntro'), { onComplete: () => { completed++ } }))))
    assert.equal(document.documentElement.style.overflow, 'hidden')
    assert.equal(timers.size, 1, 'Strict Mode must not leave duplicate completion timers')
    const fallback = [...timers.values()][0]
    assert.ok(reduced ? fallback.delay <= 500 : fallback.delay < 4000)
    await act(async () => document.querySelector('.logo-intro img').dispatchEvent(new dom.window.Event('animationend', { bubbles: true })))
    assert.equal(completed, 0, 'Finishing the logo entrance must not dismiss the whole intro')
    if (reduced) await act(async () => fallback.fn())
    else await act(async () => document.querySelector('.logo-intro').dispatchEvent(new dom.window.Event('animationend', { bubbles: true })))
    assert.equal(completed, 1)
    await act(async () => fallback.fn())
    assert.equal(completed, 1, 'Animation end and fallback must not complete twice')
  } finally {
    await act(async () => root.unmount())
    assert.equal(document.documentElement.style.overflow, 'scroll')
    assert.equal(timers.size, 0)
    dom.window.close(); globalThis.window = oldWindow; globalThis.document = oldDocument; globalThis.IS_REACT_ACT_ENVIRONMENT = oldAct
  }
})
