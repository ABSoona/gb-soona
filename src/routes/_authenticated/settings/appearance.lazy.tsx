import SettingsAppearance from '@/features/settings/appearance'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/appearance')(
  { component: SettingsAppearance }
)
