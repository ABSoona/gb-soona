import { createLazyFileRoute } from '@tanstack/react-router'
import Demandes from '@/features/demandes'

export const Route = createLazyFileRoute('/_authenticated/demandes/')({
  component: Demandes,
})
