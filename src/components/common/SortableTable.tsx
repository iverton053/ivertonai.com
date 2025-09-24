import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import { Database } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
  pageSize?: number;
  showPagination?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyTitle = "No data available",
  emptyDescription = "There's no data to display at the moment.",
  emptyActionLabel,
  onEmptyAction,
  className = '',
  rowClassName,
  onRowClick,
  pageSize,
  showPagination = false
}: SortableTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue = a[sortState.column as keyof T];
      let bValue = b[sortState.column as keyof T];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortState.direction === 'asc' ? 1 : -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortState.direction === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      // Default string comparison
      const result = String(aValue).localeCompare(String(bValue));
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [data, sortState]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pageSize || !showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = pageSize ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column || column.sortable === false) return;

    setSortState(prevState => {
      if (prevState.column === columnKey) {
        // Cycle through: null -> asc -> desc -> null
        const nextDirection = prevState.direction === null ? 'asc' : 
                             prevState.direction === 'asc' ? 'desc' : null;
        return { column: nextDirection ? columnKey : null, direction: nextDirection };
      } else {
        return { column: columnKey, direction: 'asc' };
      }
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortState.column !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
    }
    
    if (sortState.direction === 'asc') {
      return <ChevronUp className="w-4 h-4 text-purple-400" />;
    } else if (sortState.direction === 'desc') {
      return <ChevronDown className="w-4 h-4 text-purple-400" />;
    }
    
    return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
  };

  const getRowClassName = (item: T, index: number) => {
    let baseClassName = "transition-colors hover:bg-gray-700/50";
    
    if (onRowClick) {
      baseClassName += " cursor-pointer";
    }
    
    if (typeof rowClassName === 'function') {
      baseClassName += ` ${rowClassName(item, index)}`;
    } else if (rowClassName) {
      baseClassName += ` ${rowClassName}`;
    }
    
    return baseClassName;
  };

  if (loading) {
    return (
      <div className={`glass-effect rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`glass-effect rounded-xl ${className}`}>
        <EmptyState
          icon={Database}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`glass-effect rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-4 text-left font-semibold text-gray-300 ${
                    column.sortable !== false ? 'cursor-pointer hover:text-white' : ''
                  } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''} ${
                    column.className || ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(String(column.key))}
                  tabIndex={column.sortable !== false ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && column.sortable !== false) {
                      e.preventDefault();
                      handleSort(String(column.key));
                    }
                  }}
                  role={column.sortable !== false ? 'button' : undefined}
                  aria-sort={
                    sortState.column === column.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={getRowClassName(item, index)}
                onClick={() => onRowClick?.(item, index)}
                tabIndex={onRowClick ? 0 : -1}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                    e.preventDefault();
                    onRowClick(item, index);
                  }
                }}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-gray-300 ${
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                    } ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(item[column.key as keyof T], item, index)
                      : String(item[column.key as keyof T] ?? '')
                    }
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="border-t border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * pageSize! + 1} to {Math.min(currentPage * pageSize!, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-base btn-ghost btn-sm"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-sm rounded ${
                      isCurrentPage
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn-base btn-ghost btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SortableTable;