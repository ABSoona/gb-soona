import VersementsMensuels from '@/features/rapports/versements-mensuels'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/versements-mensuels')({
  component: VersementsMensuels,
})
