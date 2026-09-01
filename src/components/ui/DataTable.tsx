'use client'

import { useState, useMemo, ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { TableSkeleton } from './LoadingSkeleton'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  empty?: ReactNode
  collapsible?: boolean
  onRowClick?: (row: T) => void
  onCollapse?: (row: T) => ReactNode
  pageSize?: number
  defaultSortedKey?: string
}

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  loading,
  empty,
  collapsible,
  onRowClick,
  onCollapse,
  pageSize = 10,
  defaultSortedKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortedKey ?? null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set())

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find(c => c.key === sortKey)
    if (!col?.sortValue) return rows
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }, [rows, sortKey, sortDir, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visible = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleExpand = (id: string | number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) return <TableSkeleton />

  if (sorted.length === 0) return <>{empty}</>

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {collapsible && <th className="w-8 px-2" />}
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground"
                  onClick={() => col.sortValue && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortValue && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                        : <ChevronsUpDown size={12} className="opacity-50" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(row => {
              const rowId = row.id
              const isOpen = expanded.has(rowId)
              return (
                <FragmentRow key={rowId}>
                  <tr
                    className={`border-b border-border/60 last:border-0 transition ${onRowClick ? 'cursor-pointer hover:bg-surface/60' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {collapsible && onCollapse && (
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); toggleExpand(rowId) }}
                          className="p-1 rounded hover:bg-surface text-muted-foreground"
                          aria-label="Expandir"
                        >
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={`px-3 py-2.5 ${col.className ?? ''}`}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {collapsible && onCollapse && isOpen && (
                    <tr className="border-b border-border/60 bg-surface/30">
                      <td className="px-4 py-3" colSpan={columns.length + 1}>
                        {onCollapse(row)}
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              )
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Página {safePage + 1} de {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="p-1.5 rounded-lg border hover:bg-surface disabled:opacity-40 transition"
              aria-label="Anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="p-1.5 rounded-lg border hover:bg-surface disabled:opacity-40 transition"
              aria-label="Próxima"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>
}