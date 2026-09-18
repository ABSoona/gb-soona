import RepartitionDepartements from '@/features/rapports/repartition-departements'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/rapports/repartition-departements')({
  component: RepartitionDepartements,
})
