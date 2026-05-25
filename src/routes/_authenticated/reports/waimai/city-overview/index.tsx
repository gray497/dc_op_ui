import { createFileRoute } from '@tanstack/react-router'
import { CityOverview } from '@/features/reports/waimai/city-overview'

function isValidDate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/city-overview/'
)({
  validateSearch: (search: Record<string, unknown>) => ({
    startDate: isValidDate(search.startDate) ? search.startDate : undefined,
    endDate: isValidDate(search.endDate) ? search.endDate : undefined,
    page: typeof search.page === 'number' && search.page > 0 ? Math.floor(search.page) : undefined,
    pageSize: typeof search.pageSize === 'number' && search.pageSize > 0 ? Math.floor(search.pageSize) : undefined,
    cities: Array.isArray(search.cities) ? (search.cities as string[]).filter(v => typeof v === 'string') : undefined,
    regions: Array.isArray(search.regions) ? (search.regions as string[]).filter(v => typeof v === 'string') : undefined,
    merchantTypes: Array.isArray(search.merchantTypes) ? (search.merchantTypes as string[]).filter(v => typeof v === 'string') : undefined,
  }),
  component: CityOverview,
})
