import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table, type ColumnFiltersState } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  enableSearchButton?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = '筛选...',
  searchKey,
  filters = [],
  enableSearchButton = false,
}: DataTableToolbarProps<TData>) {
  const [prevTableGlobalFilter, setPrevTableGlobalFilter] = useState<
    string | undefined
  >(() => {
    return enableSearchButton
      ? (table.getState().globalFilter ?? '')
      : undefined
  })
  const [localGlobalFilter, setLocalGlobalFilter] = useState<string>(() => {
    return enableSearchButton ? (table.getState().globalFilter ?? '') : ''
  })

  const currentTableGlobalFilter = table.getState().globalFilter ?? ''
  if (
    enableSearchButton &&
    currentTableGlobalFilter !== prevTableGlobalFilter
  ) {
    setPrevTableGlobalFilter(currentTableGlobalFilter)
    setLocalGlobalFilter(currentTableGlobalFilter)
  }

  const [prevTableColumnFilters, setPrevTableColumnFilters] =
    useState<ColumnFiltersState>(() => {
      return enableSearchButton ? table.getState().columnFilters : []
    })
  const [localColumnFilters, setLocalColumnFilters] =
    useState<ColumnFiltersState>(() => {
      return enableSearchButton ? table.getState().columnFilters : []
    })

  const currentTableColumnFilters = table.getState().columnFilters
  if (
    enableSearchButton &&
    currentTableColumnFilters !== prevTableColumnFilters
  ) {
    setPrevTableColumnFilters(currentTableColumnFilters)
    setLocalColumnFilters(currentTableColumnFilters)
  }

  const getSearchKeyValue = () => {
    if (!searchKey) return ''
    const found = localColumnFilters.find((f) => f.id === searchKey)
    return (found?.value as string) ?? ''
  }

  const setSearchKeyValue = (value: string) => {
    if (!searchKey) return
    setLocalColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== searchKey)
      if (!value) return filtered
      return [...filtered, { id: searchKey, value }]
    })
  }

  const getWrappedColumn = (columnId: string) => {
    const actualColumn = table.getColumn(columnId)
    if (!actualColumn) return undefined
    if (!enableSearchButton) return actualColumn

    return {
      ...actualColumn,
      getFacetedUniqueValues: () => actualColumn.getFacetedUniqueValues(),
      getFilterValue: () => {
        const found = localColumnFilters.find((f) => f.id === columnId)
        return found?.value
      },
      setFilterValue: (value: unknown) => {
        setLocalColumnFilters((prev) => {
          const filtered = prev.filter((f) => f.id !== columnId)
          if (value === undefined) return filtered
          return [...filtered, { id: columnId, value }]
        })
      },
    } as unknown as typeof actualColumn
  }

  const handleSearch = () => {
    table.setGlobalFilter(localGlobalFilter)
    table.setColumnFilters(localColumnFilters)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const isFiltered = enableSearchButton
    ? localGlobalFilter !== '' ||
      localColumnFilters.length > 0 ||
      table.getState().columnFilters.length > 0 ||
      !!table.getState().globalFilter
    : table.getState().columnFilters.length > 0 ||
      !!table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <div className='relative'>
            <Input
              placeholder={searchPlaceholder}
              value={
                enableSearchButton
                  ? getSearchKeyValue()
                  : ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                    '')
              }
              onChange={(event) =>
                enableSearchButton
                  ? setSearchKeyValue(event.target.value)
                  : table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              onKeyDown={enableSearchButton ? handleKeyDown : undefined}
              className='h-8 w-37.5 pr-7 lg:w-62.5'
            />
            {(enableSearchButton
              ? getSearchKeyValue()
              : ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')) && (
              <button
                type='button'
                onClick={() =>
                  enableSearchButton
                    ? setSearchKeyValue('')
                    : table.getColumn(searchKey)?.setFilterValue('')
                }
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label='清除筛选'
              >
                <Cross2Icon className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        ) : (
          <div className='relative'>
            <Input
              placeholder={searchPlaceholder}
              value={
                enableSearchButton
                  ? localGlobalFilter
                  : (table.getState().globalFilter ?? '')
              }
              onChange={(event) =>
                enableSearchButton
                  ? setLocalGlobalFilter(event.target.value)
                  : table.setGlobalFilter(event.target.value)
              }
              onKeyDown={enableSearchButton ? handleKeyDown : undefined}
              className='h-8 w-37.5 pr-7 lg:w-62.5'
            />
            {(enableSearchButton
              ? localGlobalFilter
              : (table.getState().globalFilter ?? '')) && (
              <button
                type='button'
                onClick={() =>
                  enableSearchButton
                    ? setLocalGlobalFilter('')
                    : table.setGlobalFilter('')
                }
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label='清除筛选'
              >
                <Cross2Icon className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = getWrappedColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {enableSearchButton && (
          <Button
            variant='default'
            size='sm'
            onClick={handleSearch}
            className='h-8 gap-1 px-3'
          >
            <SearchIcon className='h-4 w-4' />
            查询
          </Button>
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              if (enableSearchButton) {
                setLocalGlobalFilter('')
                setLocalColumnFilters([])
              }
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            重置
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
