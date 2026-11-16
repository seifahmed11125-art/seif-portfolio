const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const cache = new Map()

// Render the actual TSX markup in DOM tests without starting a preview server.
exports.component = function component(name) {
  if (cache.has(name)) return cache.get(name)
  const filename = path.resolve(__dirname, '../src/components/journey', name + '.tsx')
  const source = fs.readFileSync(filename, 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.require = specifier => specifier.startsWith('@/')
    ? require(path.resolve(__dirname, '../src', specifier.slice(2)))
    : specifier.startsWith('./')
    ? { default: component(specifier.slice(2)), __esModule: true }
    : require(specifier)
  mod._compile(compiled, filename)
  cache.set(name, mod.exports.default)
  return mod.exports.default
}
