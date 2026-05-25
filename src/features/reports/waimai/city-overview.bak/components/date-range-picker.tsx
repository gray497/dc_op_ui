import { Button } from '@/components/ui/button'

// ── DateRange 接口 ────────────────────────────────────────────────────────────

export interface DateRange {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

// ── 从 city-overview-columns 重新导出 applyDateRangeConstraint ────────────────

export { applyDateRangeConstraint } from './city-overview-columns'

// ── getDefaultDateRange ───────────────────────────────────────────────────────

/**
 * 返回最近 7 天的日期范围（含今日）
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  return {
    startDate: sevenDaysAgo.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
  }
}

// ── DateRangePicker 组件 ──────────────────────────────────────────────────────

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  onSearch: () => void
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  onSearch,
  disabled,
}: DateRangePickerProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value
    // 如果新 startDate > 当前 endDate，自动将 endDate 重置为 startDate
    const newEndDate =
      newStartDate > value.endDate ? newStartDate : value.endDate
    onChange({ startDate: newStartDate, endDate: newEndDate })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value
    // 如果新 endDate < 当前 startDate，自动将 startDate 重置为 endDate
    const newStartDate =
      newEndDate < value.startDate ? newEndDate : value.startDate
    onChange({ startDate: newStartDate, endDate: newEndDate })
  }

  return (
    <div className='flex items-center gap-2'>
      <label className='text-sm text-muted-foreground'>开始日期</label>
      <input
        type='date'
        value={value.startDate}
        onChange={handleStartDateChange}
        disabled={disabled}
        className='h-8 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50'
      />
      <span className='text-sm text-muted-foreground'>至</span>
      <label className='text-sm text-muted-foreground'>结束日期</label>
      <input
        type='date'
        value={value.endDate}
        onChange={handleEndDateChange}
        disabled={disabled}
        className='h-8 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50'
      />
      <Button variant='default' size='sm' onClick={onSearch} disabled={disabled}>
        查询
      </Button>
    </div>
  )
}
