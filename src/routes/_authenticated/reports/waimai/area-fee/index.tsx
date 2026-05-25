import { createFileRoute } from '@tanstack/react-router'
import { AreaFee } from '@/features/reports/waimai/area-fee'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/area-fee/'
)({
  component: AreaFee,
})
