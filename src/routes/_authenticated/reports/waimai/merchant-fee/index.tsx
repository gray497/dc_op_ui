import { createFileRoute } from '@tanstack/react-router'
import { MerchantFee } from '@/features/reports/waimai/merchant-fee'

export const Route = createFileRoute(
  '/_authenticated/reports/waimai/merchant-fee/'
)({
  component: MerchantFee,
})
