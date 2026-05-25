import { createFileRoute } from '@tanstack/react-router'
import { AreaSubsidy } from '@/features/reports/waimai/area-subsidy'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/area-subsidy/'
)({
  component: AreaSubsidy,
})
