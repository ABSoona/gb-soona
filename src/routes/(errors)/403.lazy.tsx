import ForbiddenError from '@/features/errors/forbidden'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/(errors)/403')({
  component: ForbiddenError,
})
