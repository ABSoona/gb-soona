import ComiteDetail from '@/features/comites/comite-detail'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/comites/$comiteId/')({
  component: ComiteDetail,
})
