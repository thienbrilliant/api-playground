import type { ResponseState } from './types'

const DEFAULT_TIMEOUT_MS = 30_000
const MAX_RESPONSE_BYTES = 2_000_000

export class RequestAbortedError extends Error {
  constructor(message = 'Request cancelled.') {
    super(message)
    this.name = 'RequestAbortedError'
  }
}

export class RequestTimeoutError extends Error {
  constructor() {
    super(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s.`)
    this.name = 'RequestTimeoutError'
  }
}

export class NetworkRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkRequestError'
  }
}

function mergeSignals(signal: AbortSignal | undefined, timeoutSignal: AbortSignal): { signal: AbortSignal; cleanup: () => void } {
  if (typeof AbortSignal.any === 'function' && signal) {
    const merged = AbortSignal.any([signal, timeoutSignal])
    return { signal: merged, cleanup: () => undefined }
  }
  if (signal) {
    const controller = new AbortController()
    const abort = () => controller.abort()
    signal.addEventListener('abort', abort, { once: true })
    timeoutSignal.addEventListener('abort', abort, { once: true })
    return {
      signal: controller.signal,
      cleanup: () => {
        signal.removeEventListener('abort', abort)
        timeoutSignal.removeEventListener('abort', abort)
      }
    }
  }
  return { signal: timeoutSignal, cleanup: () => undefined }
}

export async function executeRequest(
  input: RequestInit & { url: string },
  externalSignal?: AbortSignal,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ResponseState> {
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs)
  const merged = mergeSignals(externalSignal, timeoutController.signal)
  const startedAt = performance.now()

  try {
    const response = await fetch(input.url, { ...input, signal: merged.signal })
    const bytes = await readResponseBytes(response)
    const body = new TextDecoder().decode(bytes)
    const headers = Array.from(response.headers.entries()).map(([key, value]) => ({ key, value }))
    return {
      status: response.status,
      statusText: response.statusText,
      timeMs: Math.max(0, Math.round(performance.now() - startedAt)),
      sizeBytes: bytes.byteLength,
      headers,
      body,
      contentType: response.headers.get('content-type') ?? 'text/plain',
      truncated: bytes.truncated ?? false
    }
  } catch (error) {
    if (timeoutController.signal.aborted && !externalSignal?.aborted) throw new RequestTimeoutError()
    if (externalSignal?.aborted) throw new RequestAbortedError()
    throw new NetworkRequestError('The browser could not complete the request. Check the URL, network connection, and CORS policy.')
  } finally {
    window.clearTimeout(timeoutId)
    merged.cleanup()
  }
}

async function readResponseBytes(response: Response): Promise<Uint8Array & { truncated?: boolean }> {
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.byteLength > MAX_RESPONSE_BYTES) return Object.assign(bytes.slice(0, MAX_RESPONSE_BYTES), { truncated: true })
    return bytes
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  let truncated = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const remaining = MAX_RESPONSE_BYTES - total
    if (value.byteLength > remaining) {
      chunks.push(value.slice(0, Math.max(0, remaining)))
      total = MAX_RESPONSE_BYTES
      truncated = true
      await reader.cancel()
      break
    }
    chunks.push(value)
    total += value.byteLength
  }

  const combined = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return Object.assign(combined, { truncated })
}
