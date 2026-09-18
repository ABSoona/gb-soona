import VersementsPrevisionnel from '@/features/rapports/versements-previsionnel'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/versements-previsionnel')({
  component: VersementsPrevisionnel,
})
