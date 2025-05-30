import ComingSoon from '@/components/coming-soon'
import Documentation from '@/features/help/documentation'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/help-center/')({
  component: Documentation,
})
