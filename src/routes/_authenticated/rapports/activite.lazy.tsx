import RapportActivite from '@/features/rapports/activite'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/activite')({
  component: RapportActivite,
})
