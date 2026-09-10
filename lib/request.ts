import type { HttpMethod, RequestState } from './types'

export type PreparedRequest = {
  method: HttpMethod
  url: string
  headers: Headers
  body?: string
}

export class RequestInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestInputError'
  }
}

export function validateRequestUrl(rawUrl: string): string {
  const candidate = rawUrl.trim()
  if (!candidate) throw new RequestInputError('Enter a URL before sending the request.')

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new RequestInputError('Enter a valid URL, including http:// or https://.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new RequestInputError('Only http:// and https:// URLs are supported.')
  }

  return url.toString()
}

function appendEnabledEntries(url: URL, entries: RequestState['queryParams']) {
  for (const entry of entries) {
    if (!entry.enabled || !entry.key.trim()) continue
    url.searchParams.append(entry.key, entry.value)
  }
}

export function serializeQueryParams(url: string, entries: RequestState['queryParams']): string {
  const normalized = validateRequestUrl(url)
  const parsed = new URL(normalized)
  appendEnabledEntries(parsed, entries)
  return parsed.toString()
}

export function prepareRequest(request: RequestState): PreparedRequest {
  const url = new URL(serializeQueryParams(request.url, request.queryParams))
  const headers = new Headers()

  for (const entry of request.headers) {
    if (!entry.enabled || !entry.key.trim()) continue
    if (headers.has(entry.key)) headers.append(entry.value)
    else headers.set(entry.key, entry.value)
  }

  const body = request.body.trim()
  if (body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
    if (!isJsonLike(body)) throw new RequestInputError('Request body contains invalid JSON.')
    if (!headers.has('content-type')) headers.set('content-type', 'application/json')
  }

  return {
    method: request.method,
    url: url.toString(),
    headers,
    ...(body && request.method !== 'GET' && request.method !== 'DELETE' ? { body } : {})
  }
}

function isJsonLike(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}
