import { createLazyFileRoute } from '@tanstack/react-router'

import WebsiteDemandes from '@/features/website-demandes'

export const Route = createLazyFileRoute('/_authenticated/website-demandes/')({
  component: WebsiteDemandes,
})
