import { useEffect, useState } from 'react'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type CityOverviewRow } from '../data/schema'
import { TAB_CONFIG, type TabValue } from './city-overview-columns'

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
  const width = column.getSize()
  return {
    position: 'sticky',
    left: `${column.getStart('left')}px`,
    width: `${width}px`,
    minWidth: `${width}px`,
    zIndex: 3,
    backgroundColor: 'var(--background)',
  }
}

function getGroupHeaderPinnedStyle(
  header: import('@tanstack/react-table').Header<CityOverviewRow, unknown>
): React.CSSProperties {
  const leafColumns = header.column.getLeafColumns()
  if (leafColumns.length === 0) return {}
  const allPinned = leafColumns.every((col) => col.getIsPinned() === 'left')
  if (!allPinned) return {}
  const totalWidth = leafColumns.reduce((sum, c) => sum + c.getSize(), 0)
  return {
    position: 'sticky',
    left: `${leafColumns[0].getStart('left')}px`,
    width: `${totalWidth}px`,
    minWidth: `${totalWidth}px`,
    zIndex: 3,
    backgroundColor: 'var(--background)',
  }
}

function getPinnedClass(
  column: Column<CityOverviewRow>,
  isLastPinned: boolean
): string {
  if (!column.getIsPinned()) return ''
  // 背景色通过 inline style 设置，这里只处理阴影分隔线
  return isLastPinned ? 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]' : ''
}

function getGroupHeaderPinnedClass(
  _header: import('@tanstack/react-table').Header<CityOverviewRow, unknown>
): string {
  // 背景色通过 inline style 设置
  return ''
}

// ── 单个 Tab 的表格 ───────────────────────────────────────────────────────────

interface TabTableProps extends CityOverviewTableProps {
  tabValue: TabValue
}

function TabTable({
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
  tabValue,
}: TabTableProps) {
  const tabConfig = TAB_CONFIG.find((t) => t.value === tabValue)!
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    tabConfig.defaultVisibility
  )
  const [columnPinning] = useState<ColumnPinningState>({
    left: [
      '#',
      'report_date',
      'city_short_name',
      'city_name',
      'city_level',
      'region',
      'manager',
      'merchant_type_group',
    ],
  })

  // 切换 tab 时重置列可见性为该 tab 的默认值
  useEffect(() => {
    setColumnVisibility(tabConfig.defaultVisibility)
  }, [tabValue, tabConfig.defaultVisibility])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tabConfig.columns,
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

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const pinnedColumns = table.getLeftLeafColumns()
  const lastPinnedColumnId = pinnedColumns[pinnedColumns.length - 1]?.id

  function renderTableBody() {
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

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => {
          const isPinned = cell.column.getIsPinned()
          const width = cell.column.getSize()
          return (
            <TableCell
              key={cell.id}
              style={
                isPinned
                  ? getPinnedStyle(cell.column)
                  : {
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      backgroundColor: 'var(--background)',
                    }
              }
              className={cn(
                'border-b border-border',
                getPinnedClass(cell.column, cell.column.id === lastPinnedColumnId),
                cell.column.columnDef.meta?.className,
                cell.column.columnDef.meta?.tdClassName
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
    ))
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {filterOptions && (
        <DataTableToolbar
          table={table}
          enableSearchButton={true}
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
      {tabConfig.showHiddenTip && (
        <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <MixerHorizontalIcon className='h-3.5 w-3.5 shrink-0' />
          部分列默认已隐藏，点击右上角
          <span className='inline-flex items-center gap-0.5 rounded border px-1 py-0.5 font-medium text-foreground'>
            <MixerHorizontalIcon className='h-3 w-3' />
            视图
          </span>
          按钮可切换显示。
        </p>
      )}
      <div className='rounded-md border'>
        <Table className='min-w-max border-separate border-spacing-0'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isLeaf = header.column.getLeafColumns().length <= 1
                  const pinnedStyle = isLeaf
                    ? getPinnedStyle(header.column)
                    : getGroupHeaderPinnedStyle(header)
                  const pinnedClass = isLeaf
                    ? getPinnedClass(header.column, header.column.id === lastPinnedColumnId)
                    : getGroupHeaderPinnedClass(header)
                  const isPinned = pinnedStyle.position === 'sticky'

                  // 非 pinned 表头：leaf 列设置宽度；group header 不设宽度（让 colspan 自动撑开）
                  let style: React.CSSProperties
                  if (isPinned) {
                    style = pinnedStyle
                  } else if (isLeaf) {
                    const width = header.column.getSize()
                    style = {
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      backgroundColor: 'var(--background)',
                    }
                  } else {
                    style = { backgroundColor: 'var(--background)' }
                  }

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={style}
                      className={cn(
                        'border-b border-border',
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

// ── 主组件（带 Tabs） ─────────────────────────────────────────────────────────

export function CityOverviewTable(props: CityOverviewTableProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('pnl')

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList>
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <TabTable {...props} tabValue={activeTab} />
    </div>
  )
}
