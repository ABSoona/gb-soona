import SettingsNotifications from '@/features/settings/notifications'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/settings/notifications'
)({
  component: SettingsNotifications,
})
