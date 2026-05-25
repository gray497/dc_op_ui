import { createFileRoute } from '@tanstack/react-router'
import { ReportsCenter } from '@/features/reports'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsCenter,
})
