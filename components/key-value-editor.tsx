'use client'

import type { KeyValueEntry } from '@/lib/types'
import { PlusIcon, TrashIcon } from './icons'

type Props = {
  label: string
  entries: KeyValueEntry[]
  onChange: (entries: KeyValueEntry[]) => void
  placeholderKey: string
  placeholderValue: string
  addLabel: string
}

export function KeyValueEditor({ label, entries, onChange, placeholderKey, placeholderValue, addLabel }: Props) {
  const update = (id: string, patch: Partial<KeyValueEntry>) => {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))
  }

  const remove = (id: string) => onChange(entries.filter((entry) => entry.id !== id))
  const add = () => onChange([...entries, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, key: '', value: '', enabled: true }])

  return (
    <section aria-labelledby={`${label}-heading`} className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 id={`${label}-heading`} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</h3>
        <button type="button" onClick={add} className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 text-xs font-medium text-foreground transition hover:border-line-strong hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <PlusIcon size={14} />
          {addLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface-1">
        <div className="grid grid-cols-[28px_minmax(120px,0.8fr)_minmax(140px,1fr)_36px] border-b border-line bg-surface-2 px-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
          <div className="flex h-8 items-center justify-center">On</div>
          <div className="flex h-8 items-center px-2">Key</div>
          <div className="flex h-8 items-center px-2">Value</div>
          <div />
        </div>
        {entries.length === 0 ? (
          <div className="flex h-12 items-center justify-center px-3 text-xs text-subtle">No {label.toLowerCase()} yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[28px_minmax(120px,0.8fr)_minmax(140px,1fr)_36px] items-center border-b border-line last:border-b-0">
              <div className="flex items-center justify-center">
                <input aria-label={`Enable ${label} row`} type="checkbox" checked={entry.enabled} onChange={(event) => update(entry.id, { enabled: event.target.checked })} className="h-3.5 w-3.5 rounded border-line-strong bg-surface-2 accent-accent focus:ring-accent" />
              </div>
              <input aria-label={`${label} key`} value={entry.key} onChange={(event) => update(entry.id, { key: event.target.value })} placeholder={placeholderKey} className="h-10 min-w-0 border-l border-line bg-transparent px-2 text-sm outline-none placeholder:text-subtle focus:bg-surface-2" />
              <input aria-label={`${label} value`} value={entry.value} onChange={(event) => update(entry.id, { value: event.target.value })} placeholder={placeholderValue} className="h-10 min-w-0 border-l border-line bg-transparent px-2 font-mono text-[13px] outline-none placeholder:font-sans placeholder:text-subtle focus:bg-surface-2" />
              <button type="button" aria-label={`Remove ${label} row`} onClick={() => remove(entry.id)} className="mx-auto rounded-md p-1.5 text-subtle hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"><TrashIcon size={14} /></button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
