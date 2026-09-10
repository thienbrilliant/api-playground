import { describe, expect, it, vi } from 'vitest'
import { executeRequest, NetworkRequestError, RequestAbortedError, RequestTimeoutError } from '@/lib/network'

describe('network execution', () => {
  it('returns an HTTP error response rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not found', { status: 404, statusText: 'Not Found', headers: { 'content-type': 'text/plain' } })))
    const response = await executeRequest({ url: 'https://example.test', method: 'GET' })
    expect(response.status).toBe(404)
    expect(response.body).toBe('not found')
    vi.unstubAllGlobals()
  })

  it('normalizes network failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    await expect(executeRequest({ url: 'https://example.test', method: 'GET' })).rejects.toBeInstanceOf(NetworkRequestError)
    vi.unstubAllGlobals()
  })

  it('supports cancellation and timeout', async () => {
    vi.stubGlobal('fetch', vi.fn((_input: unknown, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })))
    const controller = new AbortController()
    const pending = executeRequest({ url: 'https://example.test', method: 'GET' }, controller.signal, 1000)
    controller.abort()
    await expect(pending).rejects.toBeInstanceOf(RequestAbortedError)

    const timeoutPending = executeRequest({ url: 'https://example.test', method: 'GET' }, undefined, 10)
    await expect(timeoutPending).rejects.toBeInstanceOf(RequestTimeoutError)
    vi.unstubAllGlobals()
  })
})
