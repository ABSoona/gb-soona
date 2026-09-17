import Rapports from '@/features/rapports'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/')({
  component: Rapports,
})
