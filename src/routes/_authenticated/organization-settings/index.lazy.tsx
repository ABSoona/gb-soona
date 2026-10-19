import OrganizationSettingsPage from '@/features/organizationSettings'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/organization-settings/')({
  component: OrganizationSettingsPage,
})
