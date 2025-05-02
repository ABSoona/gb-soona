import SignIn2 from '@/features/auth/sign-in/sign-in-2'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/(auth)/sign-in-2')({
  component: SignIn2,
})
