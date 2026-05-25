import { createFileRoute } from '@tanstack/react-router'
import { DataDownload } from '@/features/reports/city-operation/data-download'

export const Route = createFileRoute(
  '/_authenticated/reports/city-operation/data-download/'
)({
  component: DataDownload,
})
