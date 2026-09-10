export type ParsedBody =
  | { kind: 'json'; value: unknown; pretty: string }
  | { kind: 'text'; value: string }

export function parseResponseBody(body: string, contentType: string): ParsedBody {
  const trimmed = body.trim()
  if (!trimmed) return { kind: 'text', value: '' }
  if (contentType.toLowerCase().includes('json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const value: unknown = JSON.parse(body)
      return { kind: 'json', value, pretty: JSON.stringify(value, null, 2) }
    } catch {
      return { kind: 'text', value: body }
    }
  }
  return { kind: 'text', value: body }
}

export function tryFormatJson(value: string): { formatted: string; error: string | null } {
  if (!value.trim()) return { formatted: '', error: null }
  try {
    return { formatted: JSON.stringify(JSON.parse(value), null, 2), error: null }
  } catch {
    return { formatted: value, error: 'Invalid JSON' }
  }
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes >= 10 * 1024 ? 0 : 1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
