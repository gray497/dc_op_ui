import { createFileRoute } from '@tanstack/react-router'
import { CityOverview } from '@/features/reports/waimai/city-overview'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/city-overview/'
)({
  component: CityOverview,
})
