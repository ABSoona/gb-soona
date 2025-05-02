import Aides from '@/features/aides'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/aides/')({
  component: Aides,
})
