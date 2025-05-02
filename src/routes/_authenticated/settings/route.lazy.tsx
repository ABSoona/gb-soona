import Settings from '@/features/settings'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings')({
  component: Settings,
})
