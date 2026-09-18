import VersementsRecapitulatif from '@/features/rapports/versements-recapitulatif'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/versements-recapitulatif')({
  component: VersementsRecapitulatif,
})
