import { createFileRoute } from '@tanstack/react-router'
import { MerchantPnl } from '@/features/reports/waimai/merchant-pnl'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/merchant-pnl/'
)({
  component: MerchantPnl,
})
