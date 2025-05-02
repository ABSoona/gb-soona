import SettingsDisplay from '@/features/settings/display'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/display')({
  component: SettingsDisplay,
})
