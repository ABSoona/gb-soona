import NotFoundError from '@/features/errors/not-found-error'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/(errors)/404')({
  component: NotFoundError,
})
