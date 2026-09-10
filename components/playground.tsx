'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addToHistory, readHistory, writeHistory } from '@/lib/history'
import { executeRequest, NetworkRequestError, RequestAbortedError, RequestTimeoutError } from '@/lib/network'
import { prepareRequest, RequestInputError } from '@/lib/request'
import { parseResponseBody, tryFormatJson } from '@/lib/format'
import type { HistoryItem, HttpMethod, KeyValueEntry, RequestState, ResponseState } from '@/lib/types'
import { createId } from '@/lib/id'
import { CopyIcon, HistoryIcon, MoonIcon, SendIcon, SunIcon, TrashIcon, XIcon, CheckIcon } from './icons'
import { KeyValueEditor } from './key-value-editor'
import { JsonViewer } from './json-viewer'

const DEFAULT_URL = 'https://jsonplaceholder.typicode.com/todos/1'

function defaultRequest(): RequestState {
  return { method: 'GET', url: DEFAULT_URL, queryParams: [], headers: [], body: '' }
}

type RequestError = { title: string; message: string }

export function Playground() {
  const [request, setRequest] = useState<RequestState>(defaultRequest)
  const [response, setResponse] = useState<ResponseState | null>(null)
  const [requestError, setRequestError] = useState<RequestError | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyOpen, setHistoryOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [copied, setCopied] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setHistory(readHistory())
    const saved = window.localStorage.getItem('api-playground:theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    const preferred = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'
    setTheme(preferred)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { window.localStorage.setItem('api-playground:theme', theme) } catch { /* Theme persistence is best-effort. */ }
  }, [theme])

  useEffect(() => () => abortRef.current?.abort(), [])

  const updateRequest = <K extends keyof RequestState>(key: K, value: RequestState[K]) => setRequest((current) => ({ ...current, [key]: value }))

  const send = useCallback(async () => {
    if (loading) return
    setRequestError(null)
    setResponse(null)
    let prepared
    try {
      prepared = prepareRequest(request)
    } catch (error) {
      const message = error instanceof RequestInputError ? error.message : 'The request could not be prepared.'
      setRequestError({ title: 'Request not sent', message })
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const nextResponse = await executeRequest({ url: prepared.url, method: prepared.method, headers: prepared.headers, body: prepared.body }, controller.signal)
      setResponse(nextResponse)
      const nextHistory = addToHistory(request, Date.now(), history)
      setHistory(nextHistory)
      writeHistory(nextHistory)
    } catch (error) {
      if (error instanceof RequestAbortedError) setRequestError({ title: 'Request cancelled', message: 'The request was stopped before it completed.' })
      else if (error instanceof RequestTimeoutError) setRequestError({ title: 'Request timed out', message: error.message })
      else if (error instanceof NetworkRequestError) setRequestError({ title: 'Request failed', message: error.message })
      else setRequestError({ title: 'Request failed', message: 'The browser could not complete the request.' })
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }, [history, loading, request])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void send()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [send])

  const restore = (item: HistoryItem) => {
    setRequest(item.request)
    setResponse(null)
    setRequestError(null)
    setHistoryOpen(false)
  }

  const clearRequest = () => {
    setRequest(defaultRequest())
    setResponse(null)
    setRequestError(null)
  }

  const clearHistory = () => {
    setHistory([])
    writeHistory([])
  }

  const copyText = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1400)
    } catch {
      setCopied(null)
    }
  }

  const bodyPreview = useMemo(() => response ? parseResponseBody(response.body, response.contentType) : null, [response])
  const responseStatusTone = response ? (response.status >= 200 && response.status < 300 ? 'success' : response.status >= 400 ? 'danger' : 'warning') : 'subtle'

  return (
    <main className="min-h-screen bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-surface-1">
        <div className="mx-auto flex h-14 max-w-[1680px] items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line-strong bg-surface-2 font-mono text-xs font-semibold text-accent">AP</div>
            <div className="min-w-0"><div className="truncate text-sm font-semibold tracking-tight">API Playground</div><div className="hidden text-[11px] text-subtle sm:block">Browser-native HTTP client</div></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setHistoryOpen((value) => !value)} aria-pressed={historyOpen} className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-medium text-muted transition hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"><HistoryIcon size={15}/><span className="hidden sm:inline">History</span>{history.length > 0 && <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] tabular-nums">{history.length}</span>}</button>
            <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface-2 text-muted transition hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">{theme === 'light' ? <MoonIcon size={15}/> : <SunIcon size={15}/>}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 p-3 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="min-w-0 rounded-xl border border-line bg-surface-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="border-b border-line px-4 py-3 sm:px-5"><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Request</div><div className="mt-0.5 text-sm text-muted">Build and send an HTTP request.</div></div><div className="flex items-center gap-1"><button type="button" onClick={() => void copyText(request.url, 'url')} disabled={!request.url.trim()} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">{copied === 'url' ? <CheckIcon size={14}/> : <CopyIcon size={14}/>}Copy URL</button><button type="button" onClick={clearRequest} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"><TrashIcon size={14}/>Reset</button></div></div></div>
              <div className="space-y-5 p-4 sm:p-5">
                <div className="rounded-lg border border-line bg-surface-2 p-1.5">
                  <div className="grid grid-cols-[96px_minmax(0,1fr)_86px] gap-1.5">
                    <label className="sr-only" htmlFor="method">HTTP method</label>
                    <select id="method" value={request.method} onChange={(event) => updateRequest('method', event.target.value as HttpMethod)} className="h-10 rounded-md border border-line bg-surface-1 px-2.5 text-sm font-semibold text-foreground outline-none focus:border-line-strong focus:ring-2 focus:ring-accent/20">{['GET','POST','PUT','PATCH','DELETE'].map((method) => <option key={method}>{method}</option>)}</select>
                    <label className="sr-only" htmlFor="url">Request URL</label>
                    <input id="url" value={request.url} onChange={(event) => updateRequest('url', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send() }} placeholder="https://api.example.com/resource" spellCheck={false} className="h-10 min-w-0 rounded-md border border-line bg-surface-1 px-3 font-mono text-[13px] text-foreground outline-none placeholder:font-sans placeholder:text-subtle focus:border-line-strong focus:ring-2 focus:ring-accent/20" />
                    <button type="button" onClick={loading ? () => abortRef.current?.abort() : () => void send()} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"/>Cancel</> : <><SendIcon size={14}/>Send</>}</button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 px-1 text-[11px] text-subtle"><span><kbd className="rounded border border-line-strong bg-surface-1 px-1 py-0.5 font-mono text-[10px]">⌘/Ctrl</kbd> + <kbd className="rounded border border-line-strong bg-surface-1 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send</span><span className="h-1 w-1 rounded-full bg-line-strong"/><span>HTTP only</span></div>
                </div>

                <KeyValueEditor label="Query parameters" entries={request.queryParams} onChange={(value) => updateRequest('queryParams', value)} placeholderKey="parameter" placeholderValue="value" addLabel="Add parameter" />
                <KeyValueEditor label="Headers" entries={request.headers} onChange={(value) => updateRequest('headers', value)} placeholderKey="Header-Name" placeholderValue="value" addLabel="Add header" />

                <section className="space-y-2">
                  <div className="flex items-center justify-between px-1"><div><h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">JSON body</h3><p className="mt-0.5 text-xs text-subtle">Used for POST, PUT and PATCH requests.</p></div><button type="button" onClick={() => updateRequest('body', '')} className="rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Clear</button></div>
                  <div className="overflow-hidden rounded-lg border border-line bg-surface-2">
                    <textarea aria-label="JSON request body" value={request.body} onChange={(event) => updateRequest('body', event.target.value)} spellCheck={false} className="min-h-48 w-full resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-subtle focus:bg-surface-1" placeholder={'{\n  "name": "example",\n  "enabled": true\n}'} />
                    <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px] text-subtle">
                      <span>{request.body.length.toLocaleString()} chars</span>
                      <div className="flex items-center gap-2">
                        {request.body.trim() && <button type="button" onClick={() => { const result = tryFormatJson(request.body); if (!result.error) updateRequest('body', result.formatted); else setRequestError({ title: 'Invalid JSON', message: 'Format is unavailable until the request body is valid JSON.' }) }} className="hover:text-foreground">Format</button>}
                        <button type="button" onClick={() => void copyText(request.body, 'request')} className="inline-flex items-center gap-1 hover:text-foreground" disabled={!request.body}>{copied === 'request' ? <CheckIcon size={13}/> : <CopyIcon size={13}/>}Copy</button>
                      </div>
                    </div>
                  </div>
                </section>
                {requestError && <div role="alert" className={`rounded-lg border px-3.5 py-3 ${requestError.title === 'Request failed' || requestError.title === 'Request timed out' ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20' : 'border-line bg-surface-2'}`}><div className="flex items-start gap-2.5"><XIcon size={15} className="mt-0.5 shrink-0 text-danger"/><div><div className="text-sm font-medium">{requestError.title}</div><p className="mt-0.5 text-xs leading-5 text-muted">{requestError.message}</p></div></div></div>}
              </div>
            </section>

            <section className="min-w-0 rounded-xl border border-line bg-surface-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="border-b border-line px-4 py-3 sm:px-5"><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Response</div><div className="mt-0.5 text-sm text-muted">Inspect status, headers and body.</div></div>{response && <button type="button" onClick={() => void copyText(response.body, 'response')} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-medium text-muted hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">{copied === 'response' ? <CheckIcon size={14}/> : <CopyIcon size={14}/>}Copy body</button>}</div></div>
              {!response && !loading && <div className="flex min-h-[520px] items-center justify-center p-8"><div className="max-w-sm text-center"><div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 font-mono text-xs text-subtle">HTTP</div><h2 className="text-sm font-semibold">Ready for a response</h2><p className="mt-1.5 text-sm leading-6 text-subtle">Send the request to inspect its status, timing, headers and body.</p></div></div>}
              {loading && <div className="min-h-[520px] p-4 sm:p-5"><div className="mb-4 h-20 animate-pulse rounded-lg bg-surface-2"/><div className="h-[420px] animate-pulse rounded-lg bg-surface-2"/></div>}
              {response && bodyPreview && <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-4 py-4 sm:px-5">
                  <div><div className="text-[11px] font-medium uppercase tracking-wide text-subtle">Status</div><div className={`mt-1 font-mono text-lg font-semibold text-${responseStatusTone}`}>{response.status}<span className="ml-2 text-sm font-sans font-medium text-muted">{response.statusText || 'Unknown status'}</span></div></div>
                  <div><div className="text-[11px] font-medium uppercase tracking-wide text-subtle">Time</div><div className="mt-1 font-mono text-sm font-semibold">{response.timeMs} ms</div></div>
                  <div><div className="text-[11px] font-medium uppercase tracking-wide text-subtle">Size</div><div className="mt-1 font-mono text-sm font-semibold">{response.sizeBytes === null ? '—' : `${response.sizeBytes.toLocaleString()}${response.truncated ? '+' : ''} B`}</div></div>
                  <div className="ml-auto text-[11px] text-subtle">{response.contentType.split(';')[0]}</div>
                </div>
                {response.truncated && <div className="border-b border-line bg-surface-2 px-4 py-2.5 text-xs text-warning sm:px-5">Response body was capped at 2 MB for browser responsiveness.</div>}
                <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
                    <div className="flex items-center gap-4 border-b border-line px-4 sm:px-5"><div className="border-b-2 border-accent py-2.5 text-xs font-semibold">Body</div><div className="py-2.5 text-xs font-medium text-subtle">{response.body.length.toLocaleString()} chars</div></div>
                    <div className="max-h-[600px] min-h-[360px] overflow-auto bg-surface-2 p-4 scrollbar-thin sm:p-5">
                      {bodyPreview.kind === 'json' ? <JsonViewer value={bodyPreview.value} /> : <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-foreground">{bodyPreview.value || 'Empty response body.'}</pre>}
                    </div>
                  </div>
                  <details open className="group min-w-0">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-5">Response headers <span className="ml-1 font-normal text-subtle">{response.headers.length}</span></summary>
                    <div className="max-h-[560px] overflow-auto px-4 pb-4 scrollbar-thin sm:px-5">{response.headers.length === 0 ? <div className="text-xs text-subtle">No response headers exposed by the browser.</div> : response.headers.map((header) => <div key={`${header.key}:${header.value}`} className="border-t border-line py-2.5"><div className="break-all font-mono text-[11px] font-medium text-muted">{header.key}</div><div className="mt-0.5 break-words font-mono text-[11px] leading-5 text-subtle">{header.value}</div></div>)}</div>
                  </details>
                </div>
              </div>}
            </section>
          </div>
        </div>

        {historyOpen && <aside className="border-t border-line bg-surface-1 lg:border-l lg:border-t-0">
          <div className="sticky top-14 flex max-h-[calc(100vh-56px)] flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Request history</div><div className="mt-0.5 text-xs text-subtle">Stored locally in this browser.</div></div>{history.length > 0 && <button type="button" onClick={clearHistory} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Clear</button>}</div>
            <div className="overflow-auto p-2 scrollbar-thin">
              {history.length === 0 ? <div className="p-5 text-center"><HistoryIcon size={18} className="mx-auto text-subtle"/><p className="mt-3 text-sm font-medium">No requests yet</p><p className="mt-1 text-xs leading-5 text-subtle">Sent requests appear here so you can restore them later.</p></div> : history.map((item) => <button key={item.id} type="button" onClick={() => restore(item)} className="group mb-1 block w-full rounded-lg border border-transparent p-3 text-left transition hover:border-line hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"><div className="flex items-start gap-2"><span className={`mt-0.5 min-w-12 rounded border border-line px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold ${item.request.method === 'GET' ? 'text-success' : item.request.method === 'DELETE' ? 'text-danger' : 'text-accent'}`}>{item.request.method}</span><span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{item.request.url}</span></div><div className="mt-2 text-[10px] text-subtle">{new Date(item.timestamp).toLocaleString()}</div></button>)}
            </div>
          </div>
        </aside>}
      </div>
      <footer className="border-t border-line bg-surface-1 px-4 py-3 text-center text-[11px] text-subtle">Requests execute directly from your browser. APIs must allow cross-origin requests (CORS).</footer>
    </main>
  )
}
