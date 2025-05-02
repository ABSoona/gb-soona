import Demandes from '@/features/demandes'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/demandes/')({
  component: Demandes,
})
