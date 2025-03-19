import { createLazyFileRoute } from '@tanstack/react-router'
import Aides from '@/features/aides'

export const Route = createLazyFileRoute('/_authenticated/aides/')({
  component: Aides,
})
