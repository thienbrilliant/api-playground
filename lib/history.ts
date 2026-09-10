import type { HistoryItem, KeyValueEntry, RequestState } from './types'

const STORAGE_KEY = 'api-playground:history'
const MAX_ITEMS = 50

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  try { return window.localStorage } catch { return undefined }
}

export function readHistory(storage: Storage | undefined = getStorage()): HistoryItem[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryItem).slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export function writeHistory(items: HistoryItem[], storage: Storage | undefined = getStorage()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {
    // Local persistence is best-effort; a blocked storage bucket must not break requests.
  }
}

export function addToHistory(request: RequestState, timestamp: number, existing: HistoryItem[]): HistoryItem[] {
  const next: HistoryItem = { id: `${timestamp}-${Math.random().toString(36).slice(2, 6)}`, timestamp, request }
  return [next, ...existing].slice(0, MAX_ITEMS)
}

function isKeyValueEntry(value: unknown): value is KeyValueEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<KeyValueEntry>
  return typeof entry.id === 'string' && typeof entry.key === 'string' && typeof entry.value === 'string' && typeof entry.enabled === 'boolean'
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<HistoryItem>
  const request = item.request as Partial<RequestState> | undefined
  return Boolean(
    typeof item.id === 'string' &&
      typeof item.timestamp === 'number' &&
      request &&
      typeof request.url === 'string' &&
      typeof request.method === 'string' &&
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
      Array.isArray(request.queryParams) &&
      request.queryParams.every(isKeyValueEntry) &&
      Array.isArray(request.headers) &&
      request.headers.every(isKeyValueEntry) &&
      typeof request.body === 'string'
  )
}
