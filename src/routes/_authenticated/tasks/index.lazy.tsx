import Tasks from '@/features/tasks'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tasks/')({
  component: Tasks,
})
