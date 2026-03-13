import React, { useState } from 'react';
import { HiChevronUp, HiChevronDown, HiChevronUpDown } from 'react-icons/hi2';
import Skeleton from './Skeleton';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  loadingRows?: number;
  striped?: boolean;
  hoverable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
  emptyMessage?: string;
}

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  loadingRows = 5,
  striped = false,
  hoverable = true,
  onSort,
  className = '',
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    let newDir: 'asc' | 'desc' = 'asc';
    if (sortKey === key && sortDir === 'asc') {
      newDir = 'desc';
    }
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-neutral-100 ${className}`}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-100">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`
                  px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400
                  ${alignClasses[col.align || 'left']}
                  ${col.sortable ? 'cursor-pointer select-none hover:text-neutral-600' : ''}
                `}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.header}
                  {col.sortable && (
                    <span className="shrink-0">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <HiChevronUp className="h-4 w-4" />
                        ) : (
                          <HiChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <HiChevronUpDown className="h-4 w-4 opacity-40" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }, (_, rowIdx) => (
              <tr key={`skeleton-${rowIdx}`} className="border-b border-neutral-100 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-neutral-300 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`
                  border-b border-neutral-100 last:border-0 transition-colors
                  ${striped && rowIdx % 2 === 1 ? 'bg-neutral-50/50' : ''}
                  ${hoverable ? 'hover:bg-neutral-50' : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-neutral-500 ${alignClasses[col.align || 'left']}`}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : (row[col.key] as React.ReactNode) ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
