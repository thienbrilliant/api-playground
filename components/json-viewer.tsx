'use client'

import { useMemo, useState } from 'react'
import { ChevronIcon } from './icons'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type NodeProps = { value: unknown; name?: string; depth: number }

function JsonNode({ value, name, depth }: NodeProps) {
  const [open, setOpen] = useState(depth < 2)
  const composite = Array.isArray(value) || isRecord(value)
  const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : isRecord(value) ? Object.entries(value) : []

  if (!composite) {
    return <div className="leading-6" style={{ paddingLeft: depth * 14 }}><span className="text-faint">{name !== undefined ? `${name}: ` : ''}</span><Value value={value} /></div>
  }

  const label = Array.isArray(value) ? `Array(${value.length})` : `Object {${entries.length}}`
  return (
    <div className="font-mono text-[13px] leading-6">
      <button type="button" onClick={() => setOpen((current) => !current)} className="inline-flex items-center rounded px-0.5 text-left hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40" style={{ marginLeft: depth * 14 }}>
        <ChevronIcon size={13} className={`mr-0.5 transition-transform ${open ? 'rotate-90' : ''}`} />
        <span className="text-key">{name !== undefined ? `${name}: ` : ''}</span><span className="text-subtle">{label}</span>
      </button>
      {open && entries.map(([key, child]) => <JsonNode key={key} name={Array.isArray(value) ? undefined : key} value={child} depth={depth + 1} />)}
    </div>
  )
}

function Value({ value }: { value: unknown }) {
  if (value === null) return <span className="text-null">null</span>
  switch (typeof value) {
    case 'string': return <span className="text-string">&quot;{value.replaceAll('"', '\\"')}&quot;</span>
    case 'number': return <span className="text-number">{String(value)}</span>
    case 'boolean': return <span className="text-boolean">{String(value)}</span>
    default: return <span className="text-subtle">{String(value)}</span>
  }
}

export function JsonViewer({ value }: { value: unknown }) {
  const root = useMemo(() => value, [value])
  return <div className="min-w-max pr-6"><JsonNode value={root} depth={0} /></div>
}
