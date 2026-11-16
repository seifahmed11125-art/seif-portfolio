import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import postcss from 'postcss'
import { JSDOM } from 'jsdom'
import { createRequire } from 'node:module'
import { effectiveStyle, data } from './helpers/responsive.mjs'
const require = createRequire(import.meta.url), React = require('react')
const { renderToStaticMarkup } = require('react-dom/server'), { component } = require('./components.cjs')
const manifest = JSON.parse(fs.readFileSync('.next/app-build-manifest.json', 'utf8'))
const summary = []
for (const [route, page] of [['/page', 'home'], ['/projects/page', 'projects']]) {
  const files = [...new Set([...manifest.pages['/layout'], ...manifest.pages[route]].filter(file => file.endsWith('.css')))]
  const sheets = files.map(file => postcss.parse(fs.readFileSync(path.join('.next', file), 'utf8')))
  const dom = new JSDOM(renderToStaticMarkup(React.createElement(component('PortfolioShell'), { data, page })))
  for (const [width, height] of [[320, 480], [390, 844], [430, 932], [844, 390], [932, 430], [1440, 900]]) {
    const mobile = width < 1100, doc = dom.window.document, dimensions = { width, height, coarse: mobile }
    doc.querySelector('.portfolio-experience').dataset.mobileMotion = String(mobile && page === 'home')
    const css = selector => effectiveStyle(doc.querySelector(selector), dimensions, sheets)
    assert.equal(css('.all-project-grid')?.['grid-template-columns'] ?? '', page === 'projects' && width < 700 ? 'minmax(0,1fr)' : page === 'projects' ? 'repeat(2,minmax(0,1fr))' : '')
    if (page === 'home' && mobile) {
      assert.equal(css('.reel-intro').position, 'relative', 'Published hero text must remain in its grid cell')
      assert.equal(css('.reel-media').position, 'relative')
      assert.equal(css('.reel-mark').position, 'relative')
      for (const side of ['top', 'right', 'bottom', 'left']) assert.equal(css('.reel-intro')[side], 'auto')
      assert.equal(css('.reel-stage')['min-height'], '0')
      assert.ok(!css('#home-title')['font-size'].includes('4.2rem'))
      assert.equal(css('.reel-media')['grid-area'].replace(/\s/g, ''), width > height && height <= 560 ? '1/2' : '2/1')
      assert.equal(css('.journey-shell').position, 'sticky')
      assert.equal(css('.services-layout')['grid-template-columns'], 'minmax(0,1fr)')
      assert.equal(css('.scene-content').bottom, 'auto')
    } else if (page === 'home') assert.equal(css('.reel-intro').position, 'absolute')
  }
  summary.push({ route, orderedStylesheets: files, checkedViewports: 6 })
  dom.window.close()
}
console.log(JSON.stringify({ compiledCascadePassed: true, routes: summary }))
