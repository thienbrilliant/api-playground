import { describe, expect, it } from 'vitest'
import { prepareRequest, serializeQueryParams, validateRequestUrl, RequestInputError } from '@/lib/request'
import { tryFormatJson, parseResponseBody } from '@/lib/format'

const entry = (key: string, value: string, enabled = true) => ({ id: key, key, value, enabled })

describe('request utilities', () => {
  it('accepts only http and https URLs', () => {
    expect(validateRequestUrl('https://example.com')).toBe('https://example.com/')
    expect(() => validateRequestUrl('')).toThrow(RequestInputError)
    expect(() => validateRequestUrl('file:///etc/passwd')).toThrow('Only http:// and https:// URLs are supported.')
  })

  it('serializes enabled query parameters and preserves duplicates', () => {
    expect(serializeQueryParams('https://example.com/search', [entry('q', 'api'), entry('tag', 'one'), entry('tag', 'two'), entry('skip', 'x', false)])).toBe('https://example.com/search?q=api&tag=one&tag=two')
  })

  it('constructs JSON requests and avoids disabled headers', () => {
    const prepared = prepareRequest({ method: 'POST', url: 'https://example.com', queryParams: [], headers: [entry('x-test', 'yes'), entry('x-skip', 'no', false)], body: '{"ok":true}' })
    expect(prepared.method).toBe('POST')
    expect(prepared.url).toBe('https://example.com/')
    expect(prepared.headers.get('x-test')).toBe('yes')
    expect(prepared.headers.get('x-skip')).toBeNull()
    expect(prepared.headers.get('content-type')).toBe('application/json')
    expect(prepared.body).toBe('{"ok":true}')
  })

  it('rejects malformed JSON bodies', () => {
    expect(() => prepareRequest({ method: 'PATCH', url: 'https://example.com', queryParams: [], headers: [], body: '{broken' })).toThrow('Request body contains invalid JSON.')
  })
})

describe('response formatting', () => {
  it('formats JSON and falls back to raw text for malformed JSON', () => {
    expect(tryFormatJson('{"a":1}').formatted).toContain('  "a": 1')
    expect(tryFormatJson('{broken').error).toBe('Invalid JSON')
    expect(parseResponseBody('{"a":1}', 'application/json').kind).toBe('json')
    expect(parseResponseBody('{broken', 'application/json').kind).toBe('text')
  })
})
