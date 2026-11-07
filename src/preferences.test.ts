import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const html = readFileSync('index.html', 'utf8')
const script = html.match(/<script id="preference-bootstrap">([\s\S]*?)<\/script>/)?.[1]
function bootstrap() { expect(script).toBeDefined(); new Function(script ?? '')() }
beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.segmentOverride })
afterEach(() => { localStorage.clear(); document.documentElement.dataset.theme = 'light'; document.documentElement.dataset.segment = 'retail'; delete document.documentElement.dataset.segmentOverride; vi.unstubAllGlobals() })
it('applies saved choices before the app module and marks only explicit segment overrides', () => {
  expect(html.indexOf('id="preference-bootstrap"')).toBeLessThan(html.indexOf('type="module"'))
  localStorage.setItem('meridian:theme:v1', 'dark')
  localStorage.setItem('meridian:segment:v1', 'premium')
  bootstrap()
  expect(document.documentElement.dataset).toMatchObject({ theme: 'dark', segment: 'premium', segmentOverride: 'premium' })
})
it('ignores invalid storage and follows the system without persisting defaults', () => {
  localStorage.setItem('meridian:theme:v1', 'invalid')
  localStorage.setItem('meridian:segment:v1', 'invalid')
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  bootstrap()
  expect(document.documentElement.dataset).toMatchObject({ theme: 'dark', segment: 'retail' })
  expect(document.documentElement.dataset.segmentOverride).toBeUndefined()
  expect(localStorage.getItem('meridian:theme:v1')).toBe('invalid')
})
it('handles independently blocked reads and unavailable system detection', () => {
  localStorage.setItem('meridian:segment:v1', 'premium')
  const get = Storage.prototype.getItem
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) { if (key === 'meridian:theme:v1') throw new Error('blocked'); return get.call(this, key) })
  vi.stubGlobal('matchMedia', () => { throw new Error('unavailable') })
  bootstrap()
  expect(document.documentElement.dataset).toMatchObject({ theme: 'light', segment: 'premium' })
})

it('defaults to light and retail when storage and system preference are absent', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  bootstrap()
  expect(document.documentElement.dataset).toMatchObject({ theme: 'light', segment: 'retail' })
  expect(localStorage.length).toBe(0)
})
