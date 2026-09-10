export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export type KeyValueEntry = {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type RequestState = {
  method: HttpMethod
  url: string
  queryParams: KeyValueEntry[]
  headers: KeyValueEntry[]
  body: string
}

export type ResponseState = {
  status: number
  statusText: string
  timeMs: number
  sizeBytes: number | null
  headers: Array<{ key: string; value: string }>
  body: string
  contentType: string
  truncated: boolean
}

export type HistoryItem = {
  id: string
  timestamp: number
  request: RequestState
}
