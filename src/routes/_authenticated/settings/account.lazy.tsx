import SettingsAccount from '@/features/settings/account'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/account')({
  component: SettingsAccount,
})
