import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Edit2, Trash2, Copy } from 'lucide-react'
import type { Artefact } from '../../types'
import { Button } from '../common/Button'

interface ArtefactTableProps {
  artefacts: Artefact[]
  onEdit: (artefact: Artefact) => void
  onDelete: (artefactId: string) => void
  onDuplicate: (artefact: Artefact) => void
}

const columnHelper = createColumnHelper<Artefact>()

export function ArtefactTable({ artefacts, onEdit, onDelete, onDuplicate }: ArtefactTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'releaseAtTime', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [typeFilter, setTypeFilter] = useState<string>('')

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue()
          const colors: Record<string, string> = {
            email: 'bg-blue-100 text-blue-800',
            im: 'bg-purple-100 text-purple-800',
            calendar: 'bg-green-100 text-green-800',
            document: 'bg-gray-100 text-gray-800',
            image: 'bg-yellow-100 text-yellow-800',
            audio: 'bg-pink-100 text-pink-800',
          }
          return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>{type}</span>
        },
      }),
      columnHelper.accessor('releaseAtTime', {
        header: 'Release Time (min)',
        cell: (info) => <span className="text-gray-700">{info.getValue() !== undefined ? info.getValue() : '—'}</span>,
      }),
      columnHelper.accessor('locked', {
        header: 'Locked',
        cell: (info) => (
          <span className={info.getValue() ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {info.getValue() ? '🔒' : '—'}
          </span>
        ),
      }),
      columnHelper.accessor('releaseTriggers', {
        header: 'Gated',
        cell: (info) => {
          const triggers = info.getValue()
          return <span className={triggers && triggers.length > 0 ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
            {triggers && triggers.length > 0 ? '⚡' : '—'}
          </span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(info.row.original)}
              className="p-1 h-auto"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(info.row.original)}
              className="p-1 h-auto"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(info.row.original.id)}
              className="p-1 h-auto text-red-600 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete, onDuplicate]
  )

  const filteredArtefacts = useMemo(() => {
    if (!typeFilter) return artefacts
    return artefacts.filter((a) => a.type === typeFilter)
  }, [artefacts, typeFilter])

  const table = useReactTable({
    data: filteredArtefacts,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Filter by Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="email">Email</option>
            <option value="im">IM</option>
            <option value="calendar">Calendar</option>
            <option value="document">Document</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 flex items-end">
          {filteredArtefacts.length} artefact{filteredArtefacts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-xs text-gray-400">
                          {header.column.getIsSorted() === 'asc' && ' ↑'}
                          {header.column.getIsSorted() === 'desc' && ' ↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-600">
                  No artefacts yet. Create one to get started!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
