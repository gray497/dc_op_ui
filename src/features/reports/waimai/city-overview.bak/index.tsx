import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { mockCityOverviewData } from './data/mock-data'
import { CityOverviewTable } from './components/city-overview-table'
import {
  DateRangePicker,
  getDefaultDateRange,
  type DateRange,
} from './components/date-range-picker'

const route = getRouteApi('/_authenticated/reports/waimai/city-overview/')

export function CityOverview() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // 日期范围状态（从 URL 读取，默认最近 7 天）
  const defaultRange = getDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: search.startDate ?? defaultRange.startDate,
    endDate: search.endDate ?? defaultRange.endDate,
  })

  // 表格 URL 状态
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 20 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'city_short_name', searchKey: 'cities', type: 'array' },
      { columnId: 'region', searchKey: 'regions', type: 'array' },
      {
        columnId: 'merchant_type_group',
        searchKey: 'merchantTypes',
        type: 'array',
      },
    ],
  })

  const handleSearch = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
    })
  }

  // 从 mock 数据中提取筛选器选项
  const cityOptions = [
    ...new Set(mockCityOverviewData.map((r) => r.city_short_name)),
  ].map((v) => ({ label: v, value: v }))
  const regionOptions = [
    ...new Set(
      mockCityOverviewData.map((r) => r.region).filter(Boolean) as string[]
    ),
  ].map((v) => ({ label: v, value: v }))
  const merchantTypeOptions = [
    ...new Set(mockCityOverviewData.map((r) => r.merchant_type_group)),
  ].map((v) => ({ label: v, value: v }))

  return (
    <>
      <Header />
      <Main fixed fluid className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            城市维度-外卖整体分析
          </h1>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            onSearch={handleSearch}
          />
        </div>
        <CityOverviewTable
          data={mockCityOverviewData}
          isLoading={false}
          isError={false}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          ensurePageInRange={ensurePageInRange}
          filterOptions={{
            cityOptions,
            regionOptions,
            merchantTypeOptions,
          }}
        />
      </Main>
    </>
  )
}
