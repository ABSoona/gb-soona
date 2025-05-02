import Users from '@/features/users'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/users/')({
  component: Users,
})
