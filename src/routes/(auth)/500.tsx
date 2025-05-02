import GeneralError from '@/features/errors/general-error'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/500')({
  component: GeneralError,
})
