import { createFileRoute } from '@tanstack/react-router'
import { ShareholderPnl } from '@/features/reports/city-operation/shareholder-pnl'

export const Route = createFileRoute(
  '/_authenticated/reports/city-operation/shareholder-pnl/'
)({
  component: ShareholderPnl,
})
