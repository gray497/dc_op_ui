import { useEffect, useState } from 'react'
import {
  type Column,
  type ColumnFiltersState,
  type ColumnPinningState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type CityOverviewRow } from '../data/schema'
import { cityOverviewColumns } from './city-overview-columns'

// ── Props ─────────────────────────────────────────────────────────────────────

interface FilterOptions {
  cityOptions: { label: string; value: string }[]
  regionOptions: { label: string; value: string }[]
  merchantTypeOptions: { label: string; value: string }[]
}

interface CityOverviewTableProps {
  data: CityOverviewRow[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  // 来自 useTableUrlState
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  ensurePageInRange: (pageCount: number) => void
  filterOptions?: FilterOptions
}

// ── 列冻结工具函数 ─────────────────────────────────────────────────────────────

function getPinnedStyle(column: Column<CityOverviewRow>): React.CSSProperties {
  const isPinned = column.getIsPinned()
  if (!isPinned) return {}
  return {
    position: 'sticky',
    left: `${column.getStart('left')}px`,
    zIndex: 2,
  }
}

/**
 * 对于多级表头中的分组列（group column），检查其所有叶子列是否都被 pin 住。
 * 如果是，则该分组 header 也需要 sticky，left 取第一个叶子列的 getStart('left')。
 */
function getGroupHeaderPinnedStyle(
  header: import('@tanstack/react-table').Header<CityOverviewRow, unknown>
): React.CSSProperties {
  const leafColumns = header.column.getLeafColumns()
  if (leafColumns.length === 0) return {}
  const allPinned = leafColumns.every((col) => col.getIsPinned() === 'left')
  if (!allPinned) return {}
  const leftmost = leafColumns[0]
  return {
    position: 'sticky',
    left: `${leftmost.getStart('left')}px`,
    zIndex: 2,
  }
}

function getPinnedClass(
  column: Column<CityOverviewRow>,
  isLastPinned: boolean
): string {
  if (!column.getIsPinned()) return ''
  return cn('bg-background', isLastPinned && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]')
}

/**
 * 分组 header 的背景色（当所有子列都 pinned 时）
 */
function getGroupHeaderPinnedClass(
  header: import('@tanstack/react-table').Header<CityOverviewRow, unknown>
): string {
  const leafColumns = header.column.getLeafColumns()
  if (leafColumns.length === 0) return ''
  const allPinned = leafColumns.every((col) => col.getIsPinned() === 'left')
  return allPinned ? 'bg-background' : ''
}

// ── 组件 ──────────────────────────────────────────────────────────────────────

export function CityOverviewTable({
  data,
  isLoading,
  isError,
  onRetry,
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  ensurePageInRange,
  filterOptions,
}: CityOverviewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnPinning] = useState<ColumnPinningState>({
    left: ['#', 'report_date', 'city_short_name', 'merchant_type_group'],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: cityOverviewColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
      columnPinning,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableMultiSort: true,
  })

  // 筛选后页码越界时自动跳回第 1 页
  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  // 最后一个冻结列 id
  const pinnedColumns = table.getLeftLeafColumns()
  const lastPinnedColumnId = pinnedColumns[pinnedColumns.length - 1]?.id

  // ── TableBody 内容 ──────────────────────────────────────────────────────────

  function renderTableBody() {
    // 加载中：骨架屏
    if (isLoading) {
      return Array.from({ length: pagination.pageSize }).map((_, i) => (
        <TableRow key={i}>
          {table
            .getAllLeafColumns()
            .filter((col) => col.getIsVisible())
            .map((col) => (
              <TableCell key={col.id}>
                <Skeleton className='h-4 w-full' />
              </TableCell>
            ))}
        </TableRow>
      ))
    }

    // 错误状态
    if (isError) {
      return (
        <TableRow>
          <TableCell
            colSpan={table.getAllLeafColumns().length}
            className='h-32 text-center'
          >
            <p className='text-destructive mb-2'>数据加载失败</p>
            <Button variant='outline' size='sm' onClick={onRetry}>
              重试
            </Button>
          </TableCell>
        </TableRow>
      )
    }

    // 空数据
    if (table.getRowModel().rows.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={table.getAllLeafColumns().length}
            className='h-32 text-center'
          >
            <p>暂无数据</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              请调整筛选条件后重试
            </p>
          </TableCell>
        </TableRow>
      )
    }

    // 正常数据行
    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            style={getPinnedStyle(cell.column)}
            className={cn(
              getPinnedClass(cell.column, cell.column.id === lastPinnedColumnId),
              cell.column.columnDef.meta?.className,
              cell.column.columnDef.meta?.tdClassName
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  // ── 渲染 ────────────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {filterOptions && (
        <DataTableToolbar
          table={table}
          filters={[
            {
              columnId: 'city_short_name',
              title: '城市简称',
              options: filterOptions.cityOptions,
            },
            {
              columnId: 'region',
              title: '区域',
              options: filterOptions.regionOptions,
            },
            {
              columnId: 'merchant_type_group',
              title: '商家类型',
              options: filterOptions.merchantTypeOptions,
            },
          ]}
        />
      )}
      <div className='rounded-md border'>
        <Table className='min-w-max'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // leaf column：直接用 column pinning 样式
                  // group column：检查所有子列是否都 pinned
                  const isLeaf = header.column.getLeafColumns().length <= 1
                  const pinnedStyle = isLeaf
                    ? getPinnedStyle(header.column)
                    : getGroupHeaderPinnedStyle(header)
                  const pinnedClass = isLeaf
                    ? getPinnedClass(
                        header.column,
                        header.column.id === lastPinnedColumnId
                      )
                    : getGroupHeaderPinnedClass(header)

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={pinnedStyle}
                      className={cn(
                        pinnedClass,
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      {!isLoading && !isError && table.getPageCount() > 1 && (
        <DataTablePagination table={table} className='mt-auto' />
      )}
    </div>
  )
}
