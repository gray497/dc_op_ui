import { createFileRoute } from '@tanstack/react-router'
import { CitySubsidy } from '@/features/reports/waimai/city-subsidy'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/city-subsidy/'
)({
  component: CitySubsidy,
})
