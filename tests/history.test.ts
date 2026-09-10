import { describe, expect, it } from 'vitest'
import { addToHistory, readHistory } from '@/lib/history'

const request = { method: 'GET' as const, url: 'https://example.com/', queryParams: [], headers: [], body: '' }

describe('history persistence', () => {
  it('returns an empty history for corrupt storage', () => {
    const storage = { getItem: () => '{nope' } as unknown as Storage
    expect(readHistory(storage)).toEqual([])
  })

  it('adds newest requests first', () => {
    const next = addToHistory(request, 100, [])
    const newest = addToHistory({ ...request, url: 'https://example.org/' }, 200, next)
    expect(newest).toHaveLength(2)
    expect(newest[0].request.url).toBe('https://example.org/')
  })
})
